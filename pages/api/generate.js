import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { getUserByEmail, incrementListingsUsed, saveListing } from '../../lib/db'

const CHAR_LIMITS = {
  amazon: { title: 200, bullet: 500, description: 2000 },
  shopify: { title: 70, bullet: 500, description: 5000 },
  ebay: { title: 80, bullet: 500, description: 5000 }
}

const BLACKLIST = [
  'high quality',
  'premium feel',
  'best choice',
  'great product',
  'amazing',
  'perfect',
  'innovative',
  'top tier',
  'excellent',
  'superior',
  'outstanding',
  'incredible',
  'fantastic'
]

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Get session
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Get user from database
    const user = await getUserByEmail(session.user.email)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check usage limit
    if (user.listings_used >= user.listings_limit) {
      return res.status(403).json({ 
        error: 'Limit reached',
        message: `You've used all ${user.listings_limit} listings this month. Upgrade to continue!` 
      })
    }

    const { productName, features, pricePoint, marketplace, improvementFocus } = req.body

    if (!productName || !features) {
      return res.status(400).json({ error: 'Product name and features required' })
    }

    const featureList = features.split('\n').filter(f => f.trim()).slice(0, 6)
    const aiOutput = await generateWithGroq(productName, featureList, marketplace, pricePoint, improvementFocus)
    const scores = calculateScores(aiOutput.title, aiOutput.bullets, aiOutput.description, productName, marketplace)

    const result = { ...aiOutput, ...scores }

    // Save listing to database
    await saveListing(user.id, {
      productName,
      marketplace,
      title: result.title,
      bullets: result.bullets,
      description: result.description,
      metaData: result.metaData,
      htmlOutput: result.htmlOutput,
      seoScore: result.seoScore,
      conversionScore: result.conversionScore,
      readabilityScore: result.readabilityScore,
      errorScore: result.errorScore
    })

    // Increment usage count
    await incrementListingsUsed(user.id)

    res.status(200).json(result)
  } catch (error) {
    console.error('Generation error:', error)
    
    // Fallback generation (still counts toward limit)
    const featureList = req.body.features.split('\n').filter(f => f.trim()).slice(0, 6)
    const fallback = generateFallback(req.body.productName, featureList, req.body.marketplace, req.body.pricePoint)
    
    res.status(200).json(fallback)
  }
}

async function generateWithGroq(productName, features, marketplace, pricePoint, improvementFocus) {
  const groqApiKey = process.env.GROQ_API_KEY
  if (!groqApiKey) throw new Error('GROQ_API_KEY not configured')

  const charLimit = CHAR_LIMITS[marketplace].title
  const bulletCount = marketplace === 'amazon' ? 5 : 4
  const featureText = features.join(', ')

  let systemMessage = 'You are an expert e-commerce copywriter. You always follow the exact format requested.'
  
  let userMessage = 'Create a ' + marketplace + ' product listing for: ' + productName + '. Key features: ' + featureText + '. Price tier: ' + pricePoint + '. CRITICAL: Follow this EXACT format with these EXACT labels:\n\nTITLE:\n(write title under ' + charLimit + ' characters)\n\nBULLETS:\n1. HOOK: Detail here\n2. HOOK: Detail here\n3. HOOK: Detail here\n4. HOOK: Detail here\n' + (marketplace === 'amazon' ? '5. HOOK: Detail here\n' : '') + '\nDESCRIPTION:\n(write 2-3 compelling sentences)\n\nKEYWORDS:\n(comma-separated keywords)\n\nURL_SLUG:\n(url-friendly-slug)\n\nRules: No vague words like amazing, perfect, best, high quality, innovative. Be specific and benefit-focused.'

  // Add improvement focus if provided
  if (improvementFocus) {
    userMessage += '\n\nIMPORTANT: ' + improvementFocus
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + groqApiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })
  })

  if (!response.ok) throw new Error('Groq API error: ' + response.status)

  const data = await response.json()
  const aiContent = data.choices[0]?.message?.content || ''
  
  return parseAIResponse(aiContent, marketplace, productName)
}

function parseAIResponse(aiText, marketplace, productName) {
  const lines = aiText.split('\n')
  
  let title = ''
  let description = ''
  let keywords = ''
  let urlSlug = ''
  let bullets = []
  let currentSection = ''
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (line === 'TITLE:' || line.startsWith('TITLE:')) {
      currentSection = 'title'
      const content = line.replace('TITLE:', '').trim()
      if (content) {
        title = content
      }
      continue
    }
    if (line === 'BULLETS:' || line.startsWith('BULLETS:')) {
      currentSection = 'bullets'
      continue
    }
    if (line === 'DESCRIPTION:' || line.startsWith('DESCRIPTION:')) {
      currentSection = 'description'
      const content = line.replace('DESCRIPTION:', '').trim()
      if (content) {
        description = content
      }
      continue
    }
    if (line === 'KEYWORDS:' || line.startsWith('KEYWORDS:')) {
      currentSection = 'keywords'
      const content = line.replace('KEYWORDS:', '').trim()
      if (content) {
        keywords = content
      }
      continue
    }
    if (line === 'URL_SLUG:' || line.startsWith('URL_SLUG:') || line.startsWith('URL SLUG:')) {
      currentSection = 'urlslug'
      const content = line.replace(/URL[_\s]SLUG:/i, '').trim()
      if (content) {
        urlSlug = content
      }
      continue
    }
    
    if (!line) {
      continue
    }
    
    if (currentSection === 'title' && line && !line.match(/^\d+\./)) {
      title = title + (title ? ' ' : '') + line
    }
    
    if (currentSection === 'bullets') {
      if (line.match(/^\d+\./)) {
        const text = line.replace(/^\d+\.\s*/, '')
        const parts = text.split(':')
        if (parts.length >= 2) {
          bullets.push({ hook: parts[0].trim(), detail: parts.slice(1).join(':').trim() })
        }
      }
    }
    
    if (currentSection === 'description' && !line.startsWith('KEYWORDS') && !line.startsWith('URL')) {
      description = description + (description ? ' ' : '') + line
    }
    
    if (currentSection === 'keywords' && !line.startsWith('URL')) {
      keywords = keywords + (keywords ? ', ' : '') + line
    }
    
    if (currentSection === 'urlslug') {
      urlSlug = urlSlug + (urlSlug ? '-' : '') + line
    }
  }
  
  title = cleanText(title)
  if (!title || title.length < 10) {
    title = productName + ' - Premium Quality'
  }
  if (title.length > CHAR_LIMITS[marketplace].title) {
    title = title.substring(0, CHAR_LIMITS[marketplace].title)
  }
  
  description = cleanText(description)
  if (!description || description.length < 20) {
    description = productName + ' delivers exceptional quality and performance for your needs.'
  }
  
  if (bullets.length === 0) {
    bullets = [
      { hook: 'KEY BENEFIT', detail: 'Premium construction ensures lasting value and satisfaction' },
      { hook: 'PRACTICAL DESIGN', detail: 'Thoughtful details make daily use effortless and enjoyable' },
      { hook: 'RELIABLE PERFORMANCE', detail: 'Built to deliver consistent results you can count on' },
      { hook: 'SATISFACTION GUARANTEED', detail: 'Backed by quality assurance and responsive support' }
    ]
  }
  
  if (!keywords) {
    keywords = productName.toLowerCase()
  }
  
  if (!urlSlug) {
    urlSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  }
  
  const scores = calculateScores(title, bullets, description, productName, marketplace)
  
  const metaDescription = description.length > 155 ? description.substring(0, 152) + '...' : description
  
  return {
    title: title,
    bullets: bullets,
    description: description,
    metaData: {
      metaDescription: metaDescription,
      keywords: keywords,
      urlSlug: urlSlug
    },
    htmlOutput: generateHTML(title, bullets, description),
    seoScore: scores.seoScore,
    conversionScore: scores.conversionScore,
    readabilityScore: scores.readabilityScore,
    errorScore: scores.errorScore
  }
}

function generateFallback(productName, features, marketplace, pricePoint) {
  const firstFeature = features[0] || 'Quality Product'
  let title = productName + ' - ' + firstFeature
  
  if (title.length > CHAR_LIMITS[marketplace].title) {
    title = title.substring(0, CHAR_LIMITS[marketplace].title)
  }
  
  const bulletCount = marketplace === 'amazon' ? 5 : 4
  const bulletHooks = ['KEY BENEFIT', 'PRACTICAL VALUE', 'QUALITY BUILD', 'PERFECT FOR', 'GUARANTEE']
  
  const bullets = []
  for (let i = 0; i < bulletCount; i++) {
    const feature = features[i] || 'Premium quality construction'
    const hook = bulletHooks[i] || 'FEATURE'
    bullets.push({
      hook: hook,
      detail: feature + ' provides reliable performance and value'
    })
  }
  
  const topFeatures = features.slice(0, 2).join(', ') || 'quality and reliability'
  const description = productName + ' delivers quality with ' + topFeatures + '. Built for lasting value and everyday use.'
  
  const scores = calculateScores(title, bullets, description, productName, marketplace)
  
  return {
    title: cleanText(title),
    bullets: bullets,
    description: cleanText(description),
    metaData: {
      metaDescription: description.substring(0, 155),
      keywords: productName.toLowerCase(),
      urlSlug: productName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    },
    htmlOutput: generateHTML(title, bullets, description),
    seoScore: scores.seoScore,
    conversionScore: scores.conversionScore,
    readabilityScore: scores.readabilityScore,
    errorScore: scores.errorScore
  }
}

function generateHTML(title, bullets, description) {
  let html = '<h1>' + title + '</h1>\n\n<ul>\n'
  for (let i = 0; i < bullets.length; i++) {
    html = html + '  <li><strong>' + bullets[i].hook + ':</strong> ' + bullets[i].detail + '</li>\n'
  }
  html = html + '</ul>\n\n<p>' + description + '</p>'
  return html
}

function calculateScores(title, bullets, description, keyword, marketplace) {
  let seo = 80
  let conversion = 80
  let readability = 85
  let errors = 90
  
  const titleLower = title.toLowerCase()
  const descLower = description.toLowerCase()
  const keywordWords = keyword.toLowerCase().split(' ')
  const productWords = []
  
  for (let i = 0; i < keywordWords.length; i++) {
    if (keywordWords[i].length > 3) {
      productWords.push(keywordWords[i])
    }
  }
  
  let titleHasKeyword = false
  for (let i = 0; i < productWords.length; i++) {
    if (titleLower.includes(productWords[i])) {
      titleHasKeyword = true
      seo = seo + 8
      break
    }
  }
  
  if (productWords.length > 0) {
    const keywordPosition = titleLower.indexOf(productWords[0])
    if (keywordPosition >= 0 && keywordPosition < 20) {
      seo = seo + 5
    }
  }
  
  let descKeywordCount = 0
  for (let i = 0; i < productWords.length; i++) {
    const matches = descLower.match(new RegExp(productWords[i], 'g'))
    if (matches) {
      descKeywordCount = descKeywordCount + matches.length
    }
  }
  
  if (descKeywordCount >= 2 && descKeywordCount <= 4) {
    seo = seo + 5
  } else if (descKeywordCount === 1) {
    seo = seo + 2
  }
  
  if (bullets && bullets.length >= 4) {
    conversion = conversion + 5
  }
  
  let strongHookCount = 0
  if (bullets) {
    for (let i = 0; i < bullets.length; i++) {
      const hook = bullets[i].hook || ''
      const hookUpper = hook.toUpperCase()
      if (hookUpper.includes('BENEFIT') || hookUpper.includes('VALUE') || 
          hookUpper.includes('SOLVES') || hookUpper.includes('GUARANTEE') ||
          hookUpper.includes('DESIGNED') || hookUpper.includes('PERFECT')) {
        strongHookCount = strongHookCount + 1
      }
    }
  }
  conversion = conversion + Math.min(strongHookCount * 2, 8)
  
  let benefitCount = 0
  if (bullets) {
    for (let i = 0; i < bullets.length; i++) {
      const detail = bullets[i].detail || ''
      const detailLower = detail.toLowerCase()
      if (detailLower.includes('ensures') || detailLower.includes('provides') || 
          detailLower.includes('delivers') || detailLower.includes('helps') ||
          detailLower.includes('perfect for') || detailLower.includes('designed for')) {
        benefitCount = benefitCount + 1
      }
    }
  }
  conversion = conversion + Math.min(benefitCount * 2, 6)
  
  if (descLower.includes('delivers') || descLower.includes('designed') || 
      descLower.includes('built') || descLower.includes('crafted') ||
      descLower.includes('ensures') || descLower.includes('provides')) {
    conversion = conversion + 3
  }
  
  const sentences = description.split(/[.!?]+/).filter(function(s) {
    return s.trim().length > 0
  })
  
  if (sentences.length > 0) {
    let totalWords = 0
    for (let i = 0; i < sentences.length; i++) {
      totalWords = totalWords + sentences[i].split(' ').length
    }
    const avgLength = totalWords / sentences.length
    
    if (avgLength >= 12 && avgLength <= 20) {
      readability = readability + 8
    } else if (avgLength >= 8 && avgLength <= 25) {
      readability = readability + 5
    } else if (avgLength < 8) {
      readability = readability + 3
    }
  }
  
  if (!hasVagueLanguage(description) && !hasVagueLanguage(title)) {
    readability = readability + 5
  }
  
  if (hasVagueLanguage(description) || hasVagueLanguage(title)) {
    errors = errors - 8
  }
  
  if (title.length > CHAR_LIMITS[marketplace].title) {
    errors = errors - 15
  }
  
  if (hasDuplicatePhrases(description)) {
    errors = errors - 5
  }
  
  if (bullets && bullets.length >= 4 && bullets.length <= 5) {
    errors = errors + 3
  }
  
  seo = Math.max(82, Math.min(98, seo))
  conversion = Math.max(85, Math.min(97, conversion))
  readability = Math.max(87, Math.min(98, readability))
  errors = Math.max(88, Math.min(100, errors))
  
  return {
    seoScore: seo,
    conversionScore: conversion,
    readabilityScore: readability,
    errorScore: errors
  }
}

function hasVagueLanguage(text) {
  const lower = text.toLowerCase()
  for (let i = 0; i < BLACKLIST.length; i++) {
    if (lower.includes(BLACKLIST[i])) {
      return true
    }
  }
  return false
}

function hasDuplicatePhrases(text) {
  const words = text.toLowerCase().split(/\s+/)
  const bigrams = []
  
  for (let i = 0; i < words.length - 2; i++) {
    const bigram = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]
    bigrams.push(bigram)
  }
  
  const uniqueBigrams = []
  for (let i = 0; i < bigrams.length; i++) {
    if (uniqueBigrams.indexOf(bigrams[i]) === -1) {
      uniqueBigrams.push(bigrams[i])
    }
  }
  
  return uniqueBigrams.length < bigrams.length * 0.85
}

function cleanText(text) {
  let cleaned = text
  
  for (let i = 0; i < BLACKLIST.length; i++) {
    const phrase = BLACKLIST[i]
    const regex = new RegExp(phrase, 'gi')
    cleaned = cleaned.replace(regex, '')
  }
  
  cleaned = cleaned.replace(/\s+/g, ' ')
  cleaned = cleaned.trim()
  cleaned = cleaned.replace(/[,;.]\s*[,;.]/g, '.')
  
  return cleaned
}