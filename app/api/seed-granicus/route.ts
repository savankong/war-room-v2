import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@netlify/database';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const TOKEN = process.env.SAM_SYNC_TOKEN ?? 'warroom-seed-2026';

const PEOPLE = [
  {
    id: 'ind-granicus-hynes',
    name: 'Mark Hynes',
    title: 'Chief Executive Officer',
    org_full: 'Granicus',
    hierarchy_order: 1,
    photo_url: 'https://granicus.com/wp-content/uploads/2023/01/Mark-Hynes-chief-executive-officer.jpg',
    bio: 'Mark currently serves as CEO of Granicus, the leading provider of cloud-based government software solutions. Prior to Granicus, Mark served as Chief Strategy and Development Officer and President, Technology Services, for Altisource, a public real estate and mortgage technology company. Before joining Altisource, he served as President of Digi-Net Technologies, an early pioneer in marketing analytics SaaS solutions. Mark also co-founded Xevo, Inc., a leading provider of service provisioning technologies to application service providers, where he held the position of Chief Operating Officer. He began his career with Bain & Company as a consultant. He holds a Bachelor of Business Administration from James Madison University and an MBA from Harvard University.',
  },
  {
    id: 'ind-granicus-ainsbury',
    name: 'Bob Ainsbury',
    title: 'Chief Product Officer',
    org_full: 'Granicus',
    hierarchy_order: 2,
    photo_url: 'https://granicus.com/wp-content/uploads/2023/01/Bob-Ainsbury-Chief-Product-Officer.jpg',
    bio: 'Bob is the Chief Product Officer at Granicus, responsible for software engineering, security, cloud, architecture, and product management. With deep roots in software development, he has led engineering organizations of all sizes from start-ups to public companies. He is a published author and his business and technology perspectives have been quoted in the Wall Street Journal, The Financial Times, on CBS Radio, and on National Public Radio.',
  },
  {
    id: 'ind-granicus-cisek',
    name: 'Carrie Cisek',
    title: 'Chief Human Resources Officer',
    org_full: 'Granicus',
    hierarchy_order: 2,
    photo_url: 'https://granicus.com/wp-content/uploads/2023/01/Carrie-Cisek-Chief-Human-Resources-Officer.jpg',
    bio: 'Carrie leads recruitment and employee experience at Granicus. She brings a passion for creating highly engaged and customer-focused teams and has a track record of supporting the professional development of Granicus team members. Carrie has been leading human resources in growth-oriented technology companies since 1999 and has been working with Granicus since 2008. She has guided integration efforts through 13 acquisitions and was recognized with the Twin Cities Business Wonder Woman award for innovative leadership in 2017.',
  },
  {
    id: 'ind-granicus-masili',
    name: 'Gabriele "G" Masili',
    title: 'Chief Customer Officer',
    org_full: 'Granicus',
    hierarchy_order: 2,
    photo_url: 'https://granicus.com/wp-content/uploads/2023/01/G-Masili-chief-customer-officer.jpg',
    bio: 'G joined Granicus in 2022 bringing 25 years of executive leadership in customer experience, success, and support in technology companies, with a track record of designing, building, and delivering world-class experiences serving billions of customers globally. A passionate DEI advocate, G led teams of thousands across 40 geographies. Most recently, G was Microsoft\'s Chief Digital and Technology Officer for Customer Experience and Success, responsible for digital-first strategy across all Microsoft products and customer segments. Prior, he ran worldwide customer experience and support for Amazon\'s Digital Services and Devices.',
  },
  {
    id: 'ind-granicus-capriles',
    name: 'Amir Capriles',
    title: 'Chief Revenue Officer',
    org_full: 'Granicus',
    hierarchy_order: 2,
    photo_url: 'https://granicus.com/wp-content/uploads/2023/01/Amir-Capriles-Chief-Revenue-Officer.jpg',
    bio: 'Amir joined Granicus in 2022 and brings an extensive and proven track record of success building and leading high performing sales teams. He has spent the greater part of his career serving customers in the public sector, across federal and state and local government. Most recently, he was the Vice President and General Manager for Pegasystems\' government business unit. Prior to Pega, Amir held sales leadership roles at Microsoft Public Sector and Salesforce. His background also includes consulting and systems integration experience at KPMG/Bearingpoint. Amir holds a BS in Information Systems from Radford University.',
  },
  {
    id: 'ind-granicus-maclachlan',
    name: 'Richard Maclachlan',
    title: 'Chief Marketing Officer',
    org_full: 'Granicus',
    hierarchy_order: 2,
    photo_url: 'https://granicus.com/wp-content/uploads/richard-maclachlan-headshot-cmo.jpg',
    bio: 'Richard Maclachlan brings deep global experience leading enterprise marketing, go-to-market, and growth transformations across B2B SaaS and platform businesses. He is known for combining brand, digital, and creative excellence with data-driven, commercially rigorous execution to deliver growth. Most recently, Richard served as Chief Marketing and Revenue Operations Officer at Workhuman, where he led a global transformation of the go-to-market model. Earlier in his career, he held senior leadership roles at Ignition, Havas Media, and LogMeIn. Richard holds a degree in International Business and Marketing from St. Leo University.',
  },
  {
    id: 'ind-granicus-copland',
    name: 'Jordan Copland',
    title: 'Chief Financial Officer',
    org_full: 'Granicus',
    hierarchy_order: 2,
    photo_url: 'https://granicus.com/wp-content/uploads/2023/11/Jordan-Copeland-chief-financial-officer.jpg',
    bio: 'Jordan brings 30 years of experience to Granicus. Most recently, he served as CFO and EVP of Finance and Operations at Clearlake Capital Group-owned symplr Software. Prior to that, he was CFO at Vista-owned Omnitracs and earlier served as Vice President of Finance and Planning at Disney Consumer Products and EVP and CFO at GSI Commerce. Jordan earned an MBA from The Wharton School and a BA in Economics/International Relations from the University of Pennsylvania.',
  },
  {
    id: 'ind-granicus-boscoe',
    name: 'Adam Boscoe',
    title: 'VP, Corporate Development & Strategy',
    org_full: 'Granicus',
    hierarchy_order: 3,
    photo_url: 'https://granicus.com/wp-content/uploads/2023/01/Adam-Bosco-VP-Corporate-Development-Strategy.jpg',
    bio: 'Adam joined Granicus in 2021 and is a global technology executive with deep experience in building and scaling new businesses through acquisition and transformative strategic growth. Most recently, Adam was with Trimble where he oversaw the acquisition and integration of a dozen B2B software companies and led strategy formation for one of Trimble\'s largest business units. Prior to Trimble, Adam was a corporate development lead at Lockheed Martin Space Systems, Applied Materials, and Chevron Technology Ventures. He holds an MBA from UC Berkeley Haas, a master\'s in Energy Economics from the Instituto Tecnológico de Buenos Aires, and a bachelor\'s from Northwestern University.',
  },
  {
    id: 'ind-granicus-anbalagan',
    name: 'Karthik Anbalagan',
    title: 'General Manager, Emerging Technologies',
    org_full: 'Granicus',
    hierarchy_order: 3,
    photo_url: 'https://granicus.com/wp-content/uploads/team-karthik-anbalagan-1.jpg',
    bio: 'Karthik Anbalagan brings over two decades of product, technology, and business leadership at companies including Microsoft, Amazon, and Chewy, Inc. Most recently, he has been advising organizations on AI strategy, product development, and operational transformation. Prior, he held senior executive roles at Chewy, where he led customer experience and the incubation and launch of new businesses, as well as Amazon, where he managed global innovation and personalized commerce programs across digital content, physical retail, and fashion technology.',
  },
  {
    id: 'ind-granicus-macfarlane',
    name: 'Stu MacFarlane',
    title: 'General Manager, U.S. Local Government',
    org_full: 'Granicus',
    hierarchy_order: 3,
    photo_url: 'https://granicus.com/wp-content/uploads/team-Stu-MacFarlane.jpg',
    bio: 'Stu MacFarlane brings more than 30 years of leadership across technology and growth companies. He previously served as President of TransForce, where he strengthened customer retention, expanded accounts, and launched new products. His background includes serving as Chief Marketing Officer for Internet Brands\' health division, founding multiple businesses including the first online consumer review marketplace, and helping transition AT&T\'s Yellow Pages into a digital platform.',
  },
  {
    id: 'ind-granicus-boerstler',
    name: 'John Boerstler',
    title: 'General Manager, U.S. Federal Government',
    org_full: 'Granicus',
    hierarchy_order: 3,
    photo_url: 'https://granicus.com/wp-content/uploads/team-John-Boerstler.jpg',
    bio: 'John Boerstler brings over 20 years of experience spanning technology, user experience, and senior government leadership. Most recently, he led a government and commercial public affairs practice at Ipsos. Previously, John served as Chief Experience Officer at the U.S. Department of Veterans Affairs, where he led enterprise customer acquisition and experience strategies, enrolling millions of veterans into critical benefits and healthcare programs. His career also includes helping establish Ukraine\'s Ministry of Veterans Affairs and serving in leadership roles across local government, nonprofits, and the U.S. Marine Corps.',
  },
];

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('token') !== TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = (getDatabase() as any).sql;

  let upserted = 0;
  const errors: string[] = [];

  for (const p of PEOPLE) {
    try {
      await db`
        INSERT INTO contacts (id, name, title, org_id, org_full, tags, hierarchy_order, photo_url, bio)
        VALUES (
          ${p.id}, ${p.name}, ${p.title}, 'granicus', ${p.org_full},
          ARRAY['INDUSTRY'], ${p.hierarchy_order}, ${p.photo_url}, ${p.bio}
        )
        ON CONFLICT (id) DO UPDATE SET
          name            = EXCLUDED.name,
          title           = EXCLUDED.title,
          org_id          = EXCLUDED.org_id,
          org_full        = EXCLUDED.org_full,
          tags            = EXCLUDED.tags,
          hierarchy_order = EXCLUDED.hierarchy_order,
          photo_url       = EXCLUDED.photo_url,
          bio             = EXCLUDED.bio
      `;
      upserted++;
    } catch (err: unknown) {
      errors.push(`${p.id}: ${err instanceof Error ? err.message.slice(0, 80) : String(err)}`);
    }
  }

  return NextResponse.json({ upserted, errors: errors.length ? errors : undefined });
}
