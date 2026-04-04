import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

type ReportLine = {
  categoryLabel: string;
  lotLabel: string;
  quantity: number;
  unit: string;
  unitPriceHt: number;
  lineTotalHt: number;
  sharePct: number;
};

export type EstimatePdfDocumentProps = {
  generatedAt: string;
  projectName: string;
  projectTypeLabel: string | null;
  regionName: string | null;
  versionLabel: string;
  totalCostHt: number;
  totalCostTva: number;
  totalCostTtc: number;
  costPerM2Ht: number;
  costPerM2Ttc: number;
  confidenceLabel: string;
  sensitivityLow: number;
  sensitivityHigh: number;
  contingencyAmount: number;
  overheadAmount: number;
  profitAmount: number;
  lines: ReportLine[];
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 28,
    fontSize: 10,
    color: "#111827",
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 18,
  },
  eyebrow: {
    fontSize: 9,
    color: "#2563eb",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#6b7280",
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 8,
    color: "#111827",
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f9fafb",
  },
  metaLabel: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 3,
    textTransform: "uppercase",
  },
  metaValue: {
    fontSize: 11,
    fontWeight: 700,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  kpiCard: {
    width: "23.5%",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  kpiLabel: {
    fontSize: 8,
    color: "#1d4ed8",
    marginBottom: 3,
    textTransform: "uppercase",
  },
  kpiValue: {
    fontSize: 12,
    fontWeight: 700,
    color: "#111827",
  },
  rangeGrid: {
    flexDirection: "row",
    gap: 8,
  },
  rangeCard: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 10,
  },
  rangeValue: {
    fontSize: 12,
    fontWeight: 700,
    marginTop: 2,
  },
  costTable: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    alignItems: "center",
  },
  headerRow: {
    backgroundColor: "#111827",
    color: "#ffffff",
    borderBottomWidth: 0,
  },
  totalRow: {
    backgroundColor: "#f9fafb",
  },
  colCategory: {
    width: "20%",
    padding: 7,
    fontSize: 9,
  },
  colLot: {
    width: "28%",
    padding: 7,
    fontSize: 9,
  },
  colQty: {
    width: "12%",
    padding: 7,
    fontSize: 9,
    textAlign: "right",
  },
  colUnitPrice: {
    width: "16%",
    padding: 7,
    fontSize: 9,
    textAlign: "right",
  },
  colTotal: {
    width: "16%",
    padding: 7,
    fontSize: 9,
    textAlign: "right",
  },
  colShare: {
    width: "8%",
    padding: 7,
    fontSize: 9,
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    left: 28,
    right: 28,
    bottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#6b7280",
  },
});

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 1,
  }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(0)}%`;
}

export default function EstimatePdfDocument(props: EstimatePdfDocumentProps) {
  const linesTotal = props.lines.reduce((sum, line) => sum + line.lineTotalHt, 0);

  return (
    <Document
      title={`Rapport estimation - ${props.projectName}`}
      author="ÉA CostEstimator"
      subject="Rapport d'estimation de couts"
      language="fr-FR"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ÉA CostEstimator</Text>
          <Text style={styles.title}>Rapport d'estimation</Text>
          <Text style={styles.subtitle}>
            Synthese financiere et decomposition par lot
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations projet</Text>
          <View style={styles.metaGrid}>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Projet</Text>
              <Text style={styles.metaValue}>{props.projectName}</Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Version</Text>
              <Text style={styles.metaValue}>{props.versionLabel}</Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Type</Text>
              <Text style={styles.metaValue}>{props.projectTypeLabel || "-"}</Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Region / Date</Text>
              <Text style={styles.metaValue}>
                {(props.regionName || "-") + " / " + props.generatedAt}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synthese financiere</Text>
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Total HT</Text>
              <Text style={styles.kpiValue}>{formatCurrency(props.totalCostHt)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>TVA</Text>
              <Text style={styles.kpiValue}>{formatCurrency(props.totalCostTva)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Total TTC</Text>
              <Text style={styles.kpiValue}>{formatCurrency(props.totalCostTtc)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Confiance</Text>
              <Text style={styles.kpiValue}>{props.confidenceLabel}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Cout / m2 HT</Text>
              <Text style={styles.kpiValue}>{formatCurrency(props.costPerM2Ht)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Cout / m2 TTC</Text>
              <Text style={styles.kpiValue}>{formatCurrency(props.costPerM2Ttc)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Provision aleas</Text>
              <Text style={styles.kpiValue}>{formatCurrency(props.contingencyAmount)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Frais + marge</Text>
              <Text style={styles.kpiValue}>
                {formatCurrency(props.overheadAmount + props.profitAmount)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fourchette de sensibilite</Text>
          <View style={styles.rangeGrid}>
            <View style={styles.rangeCard}>
              <Text style={styles.metaLabel}>Hypothese basse</Text>
              <Text style={styles.rangeValue}>{formatCurrency(props.sensitivityLow)}</Text>
            </View>
            <View style={styles.rangeCard}>
              <Text style={styles.metaLabel}>Hypothese haute</Text>
              <Text style={styles.rangeValue}>{formatCurrency(props.sensitivityHigh)}</Text>
            </View>
            <View style={styles.rangeCard}>
              <Text style={styles.metaLabel}>Frais generaux</Text>
              <Text style={styles.rangeValue}>{formatCurrency(props.overheadAmount)}</Text>
            </View>
            <View style={styles.rangeCard}>
              <Text style={styles.metaLabel}>Marge</Text>
              <Text style={styles.rangeValue}>{formatCurrency(props.profitAmount)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Decomposition par lot</Text>
          <View style={styles.costTable}>
            <View style={[styles.row, styles.headerRow]}>
              <Text style={styles.colCategory}>Categorie</Text>
              <Text style={styles.colLot}>Lot</Text>
              <Text style={styles.colQty}>Quantite</Text>
              <Text style={styles.colUnitPrice}>PU HT</Text>
              <Text style={styles.colTotal}>Total HT</Text>
              <Text style={styles.colShare}>Part</Text>
            </View>
            {props.lines.map((line) => (
              <View key={`${line.categoryLabel}-${line.lotLabel}`} style={styles.row}>
                <Text style={styles.colCategory}>{line.categoryLabel}</Text>
                <Text style={styles.colLot}>{line.lotLabel}</Text>
                <Text style={styles.colQty}>
                  {formatNumber(line.quantity)} {line.unit}
                </Text>
                <Text style={styles.colUnitPrice}>{formatCurrency(line.unitPriceHt)}</Text>
                <Text style={styles.colTotal}>{formatCurrency(line.lineTotalHt)}</Text>
                <Text style={styles.colShare}>{formatPercent(line.sharePct)}</Text>
              </View>
            ))}
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.colCategory}></Text>
              <Text style={[styles.colLot, { fontWeight: 700 }]}>Total travaux HT</Text>
              <Text style={styles.colQty}></Text>
              <Text style={styles.colUnitPrice}></Text>
              <Text style={[styles.colTotal, { fontWeight: 700 }]}>{formatCurrency(linesTotal)}</Text>
              <Text style={[styles.colShare, { fontWeight: 700 }]}>100%</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>Document genere automatiquement par ÉA CostEstimator</Text>
          <Text
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}