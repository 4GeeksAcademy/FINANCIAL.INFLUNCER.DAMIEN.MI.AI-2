export const COMMISSION_RATE = 0.15;

function safeDivide(numerator, denominator) {
  return denominator ? numerator / denominator : 0;
}

function toPercent(numerator, denominator) {
  return safeDivide(numerator, denominator) * 100;
}

function sumBy(rows, field) {
  return rows.reduce((sum, row) => sum + (row[field] || 0), 0);
}

export function calculateConversionRate(conversions, reach) {
  return toPercent(conversions, reach);
}

export function calculateEngagementRate(engagement, reach) {
  return toPercent(engagement, reach);
}

export function getPerformanceIndicator(score) {
  if (score >= 0.85) {
    return "Top Performer";
  }
  if (score >= 0.7) {
    return "Stable";
  }
  return "Needs Attention";
}

function buildLineItems(products, productPlatformMetrics) {
  const productById = products.reduce((map, product) => {
    map[product.id] = product;
    return map;
  }, {});

  return productPlatformMetrics.map((metric) => {
    const product = productById[metric.productId];
    const price = product?.price || 0;
    const revenue = metric.conversions * price;
    const commissions = revenue * COMMISSION_RATE;

    return {
      ...metric,
      productName: product?.name || metric.productId,
      price,
      revenue,
      commissions,
      conversionRate: calculateConversionRate(metric.conversions, metric.reach),
      engagementRate: calculateEngagementRate(metric.engagement, metric.reach),
      ctr: toPercent(metric.clicks, metric.reach),
      roi: safeDivide(revenue, metric.cost),
    };
  });
}

function aggregateByPlatform(platforms, platformMetrics, lineItems) {
  const activityByPlatform = platformMetrics.reduce((map, metric) => {
    map[metric.platformId] = metric;
    return map;
  }, {});

  const grouped = lineItems.reduce((map, row) => {
    if (!map[row.platformId]) {
      map[row.platformId] = {
        platformId: row.platformId,
        reach: 0,
        clicks: 0,
        engagement: 0,
        conversions: 0,
        revenue: 0,
        commissions: 0,
        cost: 0,
      };
    }

    map[row.platformId].reach += row.reach;
    map[row.platformId].clicks += row.clicks;
    map[row.platformId].engagement += row.engagement;
    map[row.platformId].conversions += row.conversions;
    map[row.platformId].revenue += row.revenue;
    map[row.platformId].commissions += row.commissions;
    map[row.platformId].cost += row.cost;
    return map;
  }, {});

  const rows = platforms.map((platform) => {
    const totals = grouped[platform.id] || {
      reach: 0,
      clicks: 0,
      engagement: 0,
      conversions: 0,
      revenue: 0,
      commissions: 0,
      cost: 0,
    };
    const activity = activityByPlatform[platform.id] || {};

    return {
      id: platform.id,
      name: platform.name,
      ...totals,
      ...activity,
      conversionRate: calculateConversionRate(totals.conversions, totals.reach),
      engagementRate: calculateEngagementRate(totals.engagement, totals.reach),
      ctr: toPercent(totals.clicks, totals.reach),
      roi: safeDivide(totals.revenue, totals.cost),
      margin: toPercent(totals.revenue - totals.cost, totals.revenue),
      qualifiedLeadRatio: toPercent(activity.qualifiedLeads || 0, activity.leads || 0),
      persistenceRate: toPercent(activity.retainedUsers || 0, activity.activeUsers || 0),
      costPerConversion: safeDivide(totals.cost, totals.conversions),
    };
  });

  const maxRevenue = Math.max(...rows.map((row) => row.revenue), 1);
  const maxRoi = Math.max(...rows.map((row) => row.roi), 1);
  const maxEngagement = Math.max(...rows.map((row) => row.engagementRate), 1);

  return rows
    .map((row) => ({
      ...row,
      performanceScore:
        (row.revenue / maxRevenue) * 0.45 +
        (row.roi / maxRoi) * 0.35 +
        (row.engagementRate / maxEngagement) * 0.2,
    }))
    .sort((a, b) => b.performanceScore - a.performanceScore);
}

function aggregateByProduct(products, platforms, lineItems) {
  const platformNameById = platforms.reduce((map, platform) => {
    map[platform.id] = platform.name;
    return map;
  }, {});

  const grouped = lineItems.reduce((map, row) => {
    if (!map[row.productId]) {
      map[row.productId] = {
        productId: row.productId,
        productName: row.productName,
        price: row.price,
        reach: 0,
        clicks: 0,
        engagement: 0,
        conversions: 0,
        revenue: 0,
        commissions: 0,
        cost: 0,
        byPlatform: {},
      };
    }

    const target = map[row.productId];
    target.reach += row.reach;
    target.clicks += row.clicks;
    target.engagement += row.engagement;
    target.conversions += row.conversions;
    target.revenue += row.revenue;
    target.commissions += row.commissions;
    target.cost += row.cost;
    target.byPlatform[row.platformId] = {
      revenue: row.revenue,
      conversions: row.conversions,
      engagementRate: row.engagementRate,
    };

    return map;
  }, {});

  return products
    .map((product) => {
      const aggregate = grouped[product.id] || {
        productId: product.id,
        productName: product.name,
        price: product.price,
        reach: 0,
        clicks: 0,
        engagement: 0,
        conversions: 0,
        revenue: 0,
        commissions: 0,
        cost: 0,
        byPlatform: {},
      };

      const bestPlatformId = Object.entries(aggregate.byPlatform).reduce((best, [platformId, metric]) => {
        if (!best || metric.revenue > aggregate.byPlatform[best].revenue) {
          return platformId;
        }
        return best;
      }, null);

      return {
        ...aggregate,
        conversionRate: calculateConversionRate(aggregate.conversions, aggregate.reach),
        engagementRate: calculateEngagementRate(aggregate.engagement, aggregate.reach),
        roi: safeDivide(aggregate.revenue, aggregate.cost),
        margin: toPercent(aggregate.revenue - aggregate.cost, aggregate.revenue),
        bestPlatformName: platformNameById[bestPlatformId] || "N/A",
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

function buildCampaignRows(campaigns, products, platforms) {
  const productById = products.reduce((map, product) => {
    map[product.id] = product;
    return map;
  }, {});

  const platformById = platforms.reduce((map, platform) => {
    map[platform.id] = platform;
    return map;
  }, {});

  return campaigns.map((campaign) => {
    const product = productById[campaign.productId];
    const revenue = campaign.conversions * (product?.price || 0);
    const commissions = revenue * COMMISSION_RATE;
    const conversionRate = calculateConversionRate(campaign.conversions, campaign.reach);

    return {
      ...campaign,
      productName: product?.name || campaign.productId,
      platformName: platformById[campaign.platformId]?.name || campaign.platformId,
      revenue,
      commissions,
      conversionRate,
      roi: safeDivide(revenue, campaign.cost),
      ctr: toPercent(campaign.clicks, campaign.reach),
      deltaConversionRate: conversionRate - (campaign.previousConversionRate || 0),
    };
  });
}

function buildAlerts(campaignRows) {
  const alerts = [];

  campaignRows.forEach((campaign) => {
    const previousRate = campaign.previousConversionRate || 0;

    if (previousRate && campaign.conversionRate < previousRate * 0.8) {
      alerts.push({
        level: "critical",
        message: `${campaign.name}: conversion dropped sharply (${campaign.conversionRate.toFixed(2)}%).`,
      });
    }

    if (previousRate && campaign.conversionRate > previousRate * 1.25) {
      alerts.push({
        level: "positive",
        message: `${campaign.name}: conversion spike detected (${campaign.conversionRate.toFixed(2)}%).`,
      });
    }

    if (campaign.roi < 2) {
      alerts.push({
        level: "warning",
        message: `${campaign.name}: ROI is below target (${campaign.roi.toFixed(2)}x).`,
      });
    }
  });

  return alerts;
}

function buildKpis(platformRows, productRows) {
  const totals = {
    conversions: sumBy(platformRows, "conversions"),
    revenue: sumBy(platformRows, "revenue"),
    commissions: sumBy(platformRows, "commissions"),
    reach: sumBy(platformRows, "reach"),
    clicks: sumBy(platformRows, "clicks"),
    engagement: sumBy(platformRows, "engagement"),
    cost: sumBy(platformRows, "cost"),
    signUps: sumBy(platformRows, "signUps"),
    activeUsers: sumBy(platformRows, "activeUsers"),
    impressions: sumBy(platformRows, "impressions"),
    interactions: sumBy(platformRows, "interactions"),
    retainedUsers: sumBy(platformRows, "retainedUsers"),
  };

  const weightedNps = safeDivide(
    platformRows.reduce((sum, row) => sum + row.nps * row.activeUsers, 0),
    totals.activeUsers
  );
  const weightedCsat = safeDivide(
    platformRows.reduce((sum, row) => sum + row.csat * row.activeUsers, 0),
    totals.activeUsers
  );
  const weightedCompletionRate = safeDivide(
    platformRows.reduce((sum, row) => sum + row.completionRate * row.leads, 0),
    sumBy(platformRows, "leads")
  );
  const weightedChurn = safeDivide(
    platformRows.reduce((sum, row) => sum + row.churnRate * row.activeUsers, 0),
    totals.activeUsers
  );
  const avgLeadTime = safeDivide(
    platformRows.reduce((sum, row) => sum + row.avgLeadTimeDays * row.leads, 0),
    sumBy(platformRows, "leads")
  );

  return {
    totals,
    salesFunnel: {
      reachToClick: toPercent(totals.clicks, totals.reach),
      clickToSignup: toPercent(totals.signUps, totals.clicks),
      signupToConversion: toPercent(totals.conversions, totals.signUps),
      overall: toPercent(totals.conversions, totals.reach),
    },
    volume: {
      sales: totals.conversions,
      signUps: totals.signUps,
      activeUsers: totals.activeUsers,
      impressions: totals.impressions,
    },
    revenue: {
      revenue: totals.revenue,
      commissions: totals.commissions,
      estimatedMrr: totals.revenue * 0.24,
      averageSellingPrice: safeDivide(totals.revenue, totals.conversions),
    },
    engagement: {
      rate: toPercent(totals.engagement, totals.reach),
      interactions: totals.interactions,
      conversionRate: toPercent(totals.conversions, totals.reach),
    },
    retention: {
      churnRate: weightedChurn,
      persistenceRate: toPercent(totals.retainedUsers, totals.activeUsers),
      completionRate: weightedCompletionRate,
    },
    performance: {
      totalConversions: totals.conversions,
      ctr: toPercent(totals.clicks, totals.reach),
      conversionRate: toPercent(totals.conversions, totals.reach),
    },
    satisfaction: {
      nps: weightedNps,
      csat: weightedCsat,
    },
    efficiency: {
      costPerOutcome: safeDivide(totals.cost, totals.conversions),
      margin: toPercent(totals.revenue - totals.cost, totals.revenue),
      leadTimeDays: avgLeadTime,
    },
    topProduct: productRows[0] || null,
    bestPlatform: platformRows[0] || null,
  };
}

export function buildDashboardModel({
  platforms,
  products,
  platformMetrics,
  productPlatformMetrics,
  campaigns,
}) {
  const lineItems = buildLineItems(products, productPlatformMetrics);
  const platformRows = aggregateByPlatform(platforms, platformMetrics, lineItems);
  const productRows = aggregateByProduct(products, platforms, lineItems);
  const campaignRows = buildCampaignRows(campaigns, products, platforms).sort((a, b) => b.revenue - a.revenue);
  const kpis = buildKpis(platformRows, productRows);

  return {
    commissionRate: COMMISSION_RATE,
    kpis,
    drivers: {
      funnel: kpis.salesFunnel,
      platformPerformance: platformRows,
      qualityByPlatform: platformRows.map((row) => ({
        platformId: row.id,
        platformName: row.name,
        qualifiedLeadRatio: row.qualifiedLeadRatio,
        attendanceRate: row.persistenceRate,
        passRate: row.completionRate,
      })),
      productPerformance: productRows,
      activityByPlatform: platformRows.map((row) => ({
        platformId: row.id,
        platformName: row.name,
        posts: row.posts,
        stories: row.stories,
        reels: row.reels,
        videos: row.videos,
      })),
      engagementByPlatform: platformRows.map((row) => ({
        platformId: row.id,
        platformName: row.name,
        likes: row.likes,
        comments: row.comments,
        shares: row.shares,
        saves: row.saves,
        engagementRate: row.engagementRate,
      })),
      engagementByProduct: productRows.map((row) => ({
        productId: row.productId,
        productName: row.productName,
        engagementRate: row.engagementRate,
      })),
    },
    operations: {
      productsTable: productRows,
      platformsTable: platformRows,
      campaignsTable: campaignRows,
      alerts: buildAlerts(campaignRows),
      lists: {
        topProductsByRevenue: [...productRows].sort((a, b) => b.revenue - a.revenue).slice(0, 3),
        topProductsByConversion: [...productRows].sort((a, b) => b.conversionRate - a.conversionRate).slice(0, 3),
        topPlatformsByRoi: [...platformRows].sort((a, b) => b.roi - a.roi).slice(0, 3),
        topCampaignsByRevenue: [...campaignRows].sort((a, b) => b.revenue - a.revenue).slice(0, 3),
        improvementOpportunities: [
          ...campaignRows.filter((campaign) => campaign.roi < 2.5),
          ...campaignRows.filter((campaign) => campaign.conversionRate < 0.35),
        ]
          .slice(0, 4)
          .map((campaign) => ({
            id: campaign.id,
            name: campaign.name,
            reason: campaign.roi < 2.5 ? "Low ROI" : "Low conversion rate",
          })),
      },
    },
  };
}