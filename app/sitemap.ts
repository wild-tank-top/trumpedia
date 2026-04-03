import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl,               priority: 1.0, changeFrequency: "daily"   },
    { url: `${siteUrl}/fellows`,  priority: 0.8, changeFrequency: "weekly"  },
    { url: `${siteUrl}/register`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${siteUrl}/login`,    priority: 0.4, changeFrequency: "monthly" },
    { url: `${siteUrl}/terms`,    priority: 0.3, changeFrequency: "yearly"  },
    { url: `${siteUrl}/privacy`,  priority: 0.3, changeFrequency: "yearly"  },
  ];

  // 承認済み質問
  const questions = await prisma.question
    .findMany({
      where: { status: "approved" },
      select: { id: true, lastAnsweredAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  const questionPages: MetadataRoute.Sitemap = questions.map((q) => ({
    url:             `${siteUrl}/questions/${q.id}`,
    lastModified:    q.lastAnsweredAt ?? q.createdAt,
    priority:        0.7,
    changeFrequency: "weekly",
  }));

  // Fellow プロフィール
  const fellows = await prisma.user
    .findMany({
      where: { role: { in: ["fellow", "admin"] } },
      select: { id: true, createdAt: true },
    })
    .catch(() => []);

  const fellowPages: MetadataRoute.Sitemap = fellows.map((u) => ({
    url:             `${siteUrl}/contributors/${u.id}`,
    lastModified:    u.createdAt,
    priority:        0.6,
    changeFrequency: "weekly",
  }));

  return [...staticPages, ...questionPages, ...fellowPages];
}
