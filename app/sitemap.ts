import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/siteUrl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,               lastModified: now, priority: 1.0, changeFrequency: "daily"   },
    { url: `${SITE_URL}/fellows`,  lastModified: now, priority: 0.8, changeFrequency: "weekly"  },
    { url: `${SITE_URL}/terms`,    lastModified: now, priority: 0.3, changeFrequency: "yearly"  },
    { url: `${SITE_URL}/privacy`,  lastModified: now, priority: 0.3, changeFrequency: "yearly"  },
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
    url:             `${SITE_URL}/questions/${q.id}`,
    lastModified:    q.lastAnsweredAt ?? q.createdAt,
    priority:        0.7,
    changeFrequency: "weekly",
  }));

  // Fellow / Admin プロフィール（admin_fellow も含む）
  const fellows = await prisma.user
    .findMany({
      where: { role: { in: ["fellow", "admin", "admin_fellow", "master_admin"] } },
      select: { id: true, createdAt: true },
    })
    .catch(() => []);

  const fellowPages: MetadataRoute.Sitemap = fellows.map((u) => ({
    url:             `${SITE_URL}/contributors/${u.id}`,
    lastModified:    u.createdAt,
    priority:        0.6,
    changeFrequency: "weekly",
  }));

  return [...staticPages, ...questionPages, ...fellowPages];
}
