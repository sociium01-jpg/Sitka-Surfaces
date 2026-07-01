import { PrismaClient } from '@prisma/client';
import { pbkdf2Sync, randomBytes } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('Seeding database...');

  // 1. Create Default Admin User
  const adminPassword = hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('Admin user created:', admin.username);

  // 2. Seed Hero Media Slots
  const heroMedia = [
    { page: 'home', mediaType: 'image', mediaUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80' },
    { page: 'plywood', mediaType: 'image', mediaUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1920&q=80' },
    { page: 'laminates', mediaType: 'image', mediaUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=80' },
    { page: 'veneer', mediaType: 'image', mediaUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1920&q=80' },
    { page: 'decoratives', mediaType: 'image', mediaUrl: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1920&q=80' },
    { page: 'about', mediaType: 'image', mediaUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80' },
    { page: 'inspiration', mediaType: 'image', mediaUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80' },
  ];

  for (const media of heroMedia) {
    await prisma.heroMedia.upsert({
      where: { page: media.page },
      update: media,
      create: media,
    });
  }
  console.log('Hero media slots seeded.');

  // 3. Seed Page Copy Content
  const contents = [
    { page: 'home', section: 'hero', key: 'eyebrow', value: 'Sitka Surfaces' },
    { page: 'home', section: 'hero', key: 'headline', value: 'Every surface tells you what a space is made of.' },
    { page: 'home', section: 'hero', key: 'subhead', value: 'Plywood, laminates, veneer, and decoratives engineered for architects and designers who refuse to compromise on how a material looks, feels, and lasts.' },
    { page: 'home', section: 'hero', key: 'microtext', value: 'Trusted by studios and fabricators across 40 cities.' },
    
    { page: 'home', section: 'manifesto', key: 'headline', value: "We don't sell sheets. We sell decisions that outlast the project." },
    { page: 'home', section: 'manifesto', key: 'body', value: "A material choice made today gets looked at, touched, and lived with for the next twenty years. Sitka Surfaces exists for the moment an architect runs a hand across a sample and knows, immediately, that it's right. Four material worlds — Plywood, Laminates, Veneer, Decoratives — built on the same standard: consistent stock, honest specifications, and finishes that hold their character under real-world use." },
    
    { page: 'home', section: 'stats', key: 'years', value: '18+' },
    { page: 'home', section: 'stats', key: 'finishes', value: '300+' },
    { page: 'home', section: 'stats', key: 'projects', value: '2400+' },
    { page: 'home', section: 'stats', key: 'cities', value: '40' },
  ];

  for (const content of contents) {
    await prisma.pageContent.upsert({
      where: {
        page_section_key: {
          page: content.page,
          section: content.section,
          key: content.key,
        },
      },
      update: { value: content.value },
      create: content,
    });
  }
  console.log('Page content seeded.');

  // 4. Seed Testimonials
  const testimonials = [
    {
      quote: "We've stopped worrying about batch variation. What we sample is what arrives on site, every time.",
      name: "Gautam Mehta",
      role: "Principal Architect",
      company: "Studio Meridian",
      vertical: "Plywood",
      persona: "Architect",
      order: 1,
    },
    {
      quote: "Their veneer range let us match grain across an entire lobby wall without a single visible seam.",
      name: "Anjali Sen",
      role: "Interior Designer",
      company: "Formwork Interiors",
      vertical: "Veneer",
      persona: "Designer",
      order: 2,
    },
    {
      quote: "Sitka's laminates have been our default spec for every high-traffic commercial project for the last three years.",
      name: "Rajesh Malhotra",
      role: "Project Lead",
      company: "Cedar Point Hospitality",
      vertical: "Laminates",
      persona: "Contractor",
      order: 3,
    },
    {
      quote: "Reorders are the real test of a material supplier. Three years in, the color match is still exact.",
      name: "Vikram Dev",
      role: "Contracting Partner",
      company: "Bellwood Build Co.",
      vertical: "General",
      persona: "Contractor",
      order: 4,
    },
    {
      quote: "As a dealer, consistent stock availability matters as much as the product itself. Sitka delivers both.",
      name: "Sanjay Shah",
      role: "Distribution Partner",
      company: "Shah Materials",
      vertical: "General",
      persona: "Dealer",
      order: 5,
    },
    {
      quote: "Their team helped us specify the right plywood grade for a marine-facing facade — something most suppliers wouldn't have caught.",
      name: "Karan Johar",
      role: "Site Engineer",
      company: "Bluebay Projects",
      vertical: "Plywood",
      persona: "Contractor",
      order: 6,
    },
  ];

  await prisma.testimonial.deleteMany({});
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }
  console.log('Testimonials seeded.');

  // 5. Seed Products
  const products = [
    // PLYWOOD
    {
      name: 'Sitka MR Plywood',
      slug: 'sitka-mr-plywood',
      vertical: 'PLYWOOD',
      category: 'MR Grade',
      description: 'Moisture resistant plywood panels engineered for interior applications, general cabinetry, and wardrobe cores.',
      specs: JSON.stringify({
        'Grade': 'MR Grade (IS 303)',
        'Core Type': 'Hardwood Core',
        'Thicknesses': '6mm, 9mm, 12mm, 16mm, 19mm, 25mm',
        'Bonding': 'Melamine Urea Formaldehyde',
        'Emission': 'E1 Compliant',
      }),
      swatches: JSON.stringify([
        { name: 'Raw Wood Birch', value: '#d7c4a3' },
        { name: 'Raw Wood Poplar', value: '#e2d4bd' },
      ]),
      applications: 'Wardrobe cores, Living room cabinets, Bedroom furniture, Partition walls',
      tags: 'interior, moisture-resistant, MUF, MUF-bonding',
      isFeatured: true,
    },
    {
      name: 'Sitka BWR Marine Plywood',
      slug: 'sitka-bwr-marine-plywood',
      vertical: 'PLYWOOD',
      category: 'BWR / BWP Grade',
      description: 'Boiling Water Resistant panel built to withstand high humidity and direct water contact. Perfect for kitchens and washrooms.',
      specs: JSON.stringify({
        'Grade': 'BWP (IS 710)',
        'Core Type': 'Gurjan & Select Hardwood',
        'Thicknesses': '12mm, 16mm, 19mm',
        'Bonding': 'Phenol Formaldehyde (PF)',
        'Water Resistance': 'Boiling Water Proof (72 hours test)',
      }),
      swatches: JSON.stringify([
        { name: 'Red Gurjan Core', value: '#8f4f34' },
      ]),
      applications: 'Modular kitchens, Vanity cabinets, Bathroom partitions, Utility rooms',
      tags: 'kitchen, waterproof, premium-core',
      isFeatured: true,
    },
    {
      name: 'Sitka Flexi-Ply',
      slug: 'sitka-flexi-ply',
      vertical: 'PLYWOOD',
      category: 'Flexible Plywood',
      description: 'Bendable plywood sheet designed for curved furniture, pillars, and creative radius millwork.',
      specs: JSON.stringify({
        'Grade': 'Flexible Utility',
        'Core Type': 'Open-grain flexible hardwood',
        'Thicknesses': '6mm, 9mm',
        'Bending Radius': 'Min 150mm',
        'Bonding': 'MR Adhesive',
      }),
      swatches: JSON.stringify([
        { name: 'Soft Flex Birch', value: '#decfa7' },
      ]),
      applications: 'Pillars, Rounded countertops, Curved reception desks, Artistic ceilings',
      tags: 'curved, flexible, design-accent',
    },

    // LAMINATES
    {
      name: 'Chalk White Super-Matte',
      slug: 'chalk-white-super-matte',
      vertical: 'LAMINATES',
      category: 'Matte & Suede Finish',
      description: 'Super-matte white laminate featuring anti-fingerprint technology, ideal for high-use cabinet fronts and workspace tops.',
      specs: JSON.stringify({
        'Finish': 'Super-Matte / Anti-Fingerprint',
        'Thickness': '1.0mm',
        'Gloss Level': '< 3 GU',
        'Scratch Resistance': 'High (4N rating)',
        'Sheet Size': '8ft x 4ft',
      }),
      swatches: JSON.stringify([
        { name: 'Chalk White', value: '#f4f3ef' },
      ]),
      applications: 'Kitchen cabinets, Office desks, Wardrobe doors, Wall panelling',
      tags: 'anti-fingerprint, matte, white, clean',
      isFeatured: true,
    },
    {
      name: 'Smoked Walnut Woodgrain Gloss',
      slug: 'smoked-walnut-woodgrain-gloss',
      vertical: 'LAMINATES',
      category: 'High Gloss',
      description: 'High-gloss woodgrain laminate featuring the deep tones of smoked American walnut. Rich depth and reflection.',
      specs: JSON.stringify({
        'Finish': 'High Gloss (Mirror)',
        'Thickness': '1.2mm',
        'Gloss Level': '90 GU',
        'Scratch Resistance': 'Standard',
        'Sheet Size': '8ft x 4ft',
      }),
      swatches: JSON.stringify([
        { name: 'Smoked Walnut', value: '#3a271d' },
      ]),
      applications: 'Living room TV backdrops, Display fixtures, Lobby accents',
      tags: 'gloss, walnut, woodgrain, reflective',
      isFeatured: true,
    },

    // VENEER
    {
      name: 'American Walnut Crown Cut',
      slug: 'american-walnut-crown-cut',
      vertical: 'VENEER',
      category: 'Natural Wood Veneer',
      description: 'Premium natural American Walnut veneer exhibiting the characteristic crown cathedral pattern. Sliced sequentially.',
      specs: JSON.stringify({
        'Species': 'American Black Walnut (Juglans nigra)',
        'Cut': 'Crown / Flat Cut',
        'Thickness': '0.6mm face on fleece backer',
        'Match Type': 'Sequence Matched',
        'State': 'Raw (requires polishing)',
      }),
      swatches: JSON.stringify([
        { name: 'Natural Walnut Grain', value: '#503829' },
      ]),
      applications: 'Executive desks, Boardroom panels, Luxury doors, TV units',
      tags: 'natural, premium, crown-cut, walnut',
      isFeatured: true,
    },
    {
      name: 'Silver Oak Rift Cut',
      slug: 'silver-oak-rift-cut',
      vertical: 'VENEER',
      category: 'Engineered Veneer',
      description: 'Reconstructed oak veneer providing linear straight grain matching across large commercial surfaces without variation.',
      specs: JSON.stringify({
        'Wood Type': 'Reconstructed Ash/Oak',
        'Cut': 'Rift / Straight Linear',
        'Thickness': '0.6mm',
        'Grain Consistency': '100% Matching',
        'State': 'Raw',
      }),
      swatches: JSON.stringify([
        { name: 'Silver Linear Oak', value: '#b5a593' },
      ]),
      applications: 'Hotel wall cladding, Wardrobes at scale, Office doors',
      tags: 'engineered, linear, oak, consistent',
    },

    // DECORATIVES
    {
      name: 'Sleek Walnut Edgebanding PVC',
      slug: 'sleek-walnut-edgebanding-pvc',
      vertical: 'DECORATIVES',
      category: 'Edgebanding',
      description: 'PVC edge band color-matched to the Smoked Walnut laminate range, ensuring a clean and seamless edge profile.',
      specs: JSON.stringify({
        'Material': 'PVC (Polyvinyl Chloride)',
        'Width': '22mm, 45mm',
        'Thickness': '2.0mm',
        'Matching SKU': 'Smoked Walnut Gloss',
      }),
      swatches: JSON.stringify([
        { name: 'Walnut edge match', value: '#3a271d' },
      ]),
      applications: 'Cabinet door edges, Table borders, Shelving outlines',
      tags: 'edgebanding, pvc, seamless-match',
    },
    {
      name: 'Ribbed Charcoal Acoustic Panel',
      slug: 'ribbed-charcoal-acoustic-panel',
      vertical: 'DECORATIVES',
      category: 'Acoustic Decorative Panels',
      description: 'Textured ribbed wall panel combining sound-dampening felt with premium charcoal wood-lamella detailing.',
      specs: JSON.stringify({
        'Panel Size': '9ft x 1.5ft',
        'Thickness': '18mm',
        'Felt Backer': 'PET Recycled Felt (9mm)',
        'NRC Rating': '0.82 (High absorption)',
      }),
      swatches: JSON.stringify([
        { name: 'Charcoal Slats', value: '#242220' },
      ]),
      applications: 'Home theatres, Office meeting rooms, Bedroom feature walls',
      tags: 'acoustic, ribbed, wall-cladding, soundproof',
      isFeatured: true,
    },
  ];

  await prisma.product.deleteMany({});
  for (const p of products) {
    await prisma.product.create({ data: p });
  }
  console.log('Products seeded.');

  // 6. Seed Blog Posts
  const posts = [
    {
      title: 'Plywood, Laminate, or Veneer: How to Actually Choose',
      slug: 'plywood-laminate-or-veneer-how-to-actually-choose',
      category: 'Material Guides',
      summary: 'Every project eventually hits the same question — here\'s how to choose and combine surfaces for a space.',
      content: `Every project eventually hits the same question: which surface is right for this application? The honest answer is that plywood, laminate, and veneer aren't competing for the same job — they're solving different problems.

Start with what the surface needs to survive. A kitchen countertop takes daily scratching, heat, and moisture — that's laminate territory, specifically a compact or high-durability grade. A boardroom feature wall is judged on how it looks under light, not how it survives a spill — that's where veneer's natural grain earns its place. And underneath almost everything is plywood, doing the structural work no one notices until it fails.

### Think in layers, not choices
Most real projects use all three: a plywood core for structure, a veneer or laminate face for finish, and decorative edgebanding to complete it. The question isn't "plywood vs. laminate vs. veneer" — it's which combination, in which order, for this specific surface.

### Match consistency needs to material type
If a project needs exact color repeatability across a large run — a hotel corridor, a retail rollout — laminate's manufactured consistency will outperform natural veneer, which varies by nature. If the brief calls for the character only real wood grain provides, veneer is worth the tighter tolerance for variation.

When in doubt, sample before you specify. No description substitutes for seeing a finish under your actual site lighting. Request physical samples for anything going into a client-facing space.`,
      author: 'Materials Specialist',
      status: 'PUBLISHED',
    },
    {
      title: 'What FSC Certification Actually Means for Your Project',
      slug: 'what-fsc-certification-actually-means-for-your-project',
      category: 'Sustainability',
      summary: 'A chain of custody, not just a sourcing claim — what to verify before you specify sustainable materials.',
      content: `FSC (Forest Stewardship Council) certification gets mentioned on nearly every material spec sheet, but few projects dig into what it actually guarantees.

### It's a chain of custody, not just a sourcing claim
FSC certification tracks timber from the forest it was harvested in through every stage of manufacturing to the finished panel. A genuinely certified product carries documentation at every handoff — if a supplier can't produce that paper trail, the certification claim is worth questioning.

### It affects more than the environment
Certified forestry practices tend to correlate with more consistent timber quality — managed forests produce more uniform grain and grade than unmanaged harvesting. Sustainability and material consistency aren't separate conversations.

### It matters for green building compliance
Projects targeting LEED, WELL, or similar certifications often require documented FSC chain-of-custody for a percentage of wood-based materials. Confirming certification status before specification avoids compliance issues late in a project.

### What to ask a supplier
Request the FSC certificate number and confirm it's active and matches the specific product line — certification is granted per product range, not company-wide, in many cases.`,
      author: 'Green Building Consultant',
      status: 'PUBLISHED',
    },
    {
      title: 'Designing With Grain: A Short Guide to Veneer Matching',
      slug: 'designing-with-grain-a-short-guide-to-veneer-matching',
      category: 'Design Trends',
      summary: 'Book-matched, slip-matched, or random-matched — the grain layout decision that makes a wood wall feel intentional.',
      content: `The difference between a wall that looks intentional and one that looks assembled from leftover sheets often comes down to a single decision: how the veneer panels are matched.

### Book-Matching
Book-matching mirrors adjacent sheets like the pages of an open book, creating a symmetrical pattern from the grain itself. It's the standard choice for feature walls and large panel runs where symmetry reads as considered design.

### Slip-Matching
Slip-matching repeats the same grain pattern side by side without mirroring — a more subtle, uniform look that works well in spaces where you want texture without a strong visual pattern.

### Random Matching
Random or whole-piece matching uses sequential cuts from a single log section, prioritizing continuity of grain over a repeating pattern — often the choice for a more organic, less "designed" feel.

### The cut matters as much as the match
Quarter-cut veneer's straight grain reads as more formal and architectural; rotary-cut's wide, wild pattern feels more natural and less controlled. Choose the cut before the match — the match only works with grain that suits it.`,
      author: 'Lead Designer',
      status: 'PUBLISHED',
    },
  ];

  await prisma.post.deleteMany({});
  for (const post of posts) {
    await prisma.post.create({ data: post });
  }
  console.log('Blog posts seeded.');

  console.log('Database seeding complete successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
