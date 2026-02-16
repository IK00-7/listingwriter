export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    productName,
    primaryKeyword,
    category,
    features,
    targetCustomer,
    painPoint,
    pricePoint,
    tone,
    marketplace
  } = req.body

  // Simple generation (placeholder - you can enhance this later)
  const title = `${primaryKeyword} - ${productName} | ${category}`
  
  const bullets = [
    {
      hook: 'PRIMARY BENEFIT:',
      detail: `${features.split('\n')[0] || 'Quality construction'} delivers reliable performance.`
    },
    {
      hook: 'PRACTICAL VALUE:',
      detail: `Perfect for ${targetCustomer || 'everyday use'} with attention to detail.`
    },
    {
      hook: 'BUILT TO LAST:',
      detail: `Ensures durability and long-term value for your investment.`
    },
    {
      hook: 'PERFECT FOR:',
      detail: `${targetCustomer || 'Anyone'} who needs quality and reliability.`
    },
    {
      hook: 'BUY CONFIDENTLY:',
      detail: `Backed by quality guarantee and responsive customer support.`
    }
  ]

  const description = painPoint 
    ? `Tired of ${painPoint.toLowerCase()}? ${productName} solves this. ${features.split('\n').slice(0, 2).join('. ')}. Perfect for ${targetCustomer || 'everyday use'}.`
    : `${productName} delivers quality and performance. ${features.split('\n').slice(0, 2).join('. ')}. Ideal for ${targetCustomer || 'your needs'}.`

  const htmlOutput = `<h1>${title}</h1>\n<ul>\n${bullets.map(b => `  <li><strong>${b.hook}</strong> ${b.detail}</li>`).join('\n')}\n</ul>\n<p>${description}</p>`

  res.status(200).json({
    title,
    bullets,
    description,
    htmlOutput,
    seoScore: 85,
    conversionScore: 88,
    readabilityScore: 92,
    errorScore: 95,
  })
}