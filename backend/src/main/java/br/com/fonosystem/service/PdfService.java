package br.com.fonosystem.service;

import br.com.fonosystem.model.Prescricao;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Div;
import com.itextpdf.layout.element.LineSeparator;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.HorizontalAlignment;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class PdfService {

    private static final DeviceRgb PRIMARY_DARK = new DeviceRgb(12, 45, 72);    // #0C2D48
    private static final DeviceRgb PRIMARY_MID  = new DeviceRgb(46, 116, 181);  // #2E74B5
    private static final DeviceRgb GRAY_600     = new DeviceRgb(75, 85, 99);    // #4B5563
    private static final DeviceRgb GRAY_400     = new DeviceRgb(156, 163, 175); // #9CA3AF
    private static final DeviceRgb BG_LIGHT     = new DeviceRgb(240, 244, 248); // #F0F4F8

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy", new Locale("pt", "BR"));

    public byte[] gerarPrescricaoPdf(Prescricao prescricao) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf, PageSize.A4);
            doc.setMargins(40, 50, 40, 50);

            PdfFont fontBold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont fontRegular = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont fontItalic = PdfFontFactory.createFont(StandardFonts.HELVETICA_OBLIQUE);

            // ═══ CABEÇALHO ═══
            Paragraph header = new Paragraph("FonoSystem")
                    .setFont(fontBold)
                    .setFontSize(22)
                    .setFontColor(PRIMARY_DARK)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(2);
            doc.add(header);

            Paragraph subHeader = new Paragraph("Sistema de Gestão Fonoaudiológica")
                    .setFont(fontRegular)
                    .setFontSize(10)
                    .setFontColor(GRAY_400)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(16);
            doc.add(subHeader);

            // Linha separadora
            Table lineTop = new Table(1).useAllAvailableWidth();
            lineTop.addCell(new Cell().setBorder(Border.NO_BORDER)
                    .setBorderBottom(new SolidBorder(PRIMARY_MID, 2))
                    .setHeight(1));
            doc.add(lineTop);
            doc.add(new Paragraph("").setMarginBottom(12));

            // ═══ TÍTULO ═══
            Paragraph titulo = new Paragraph("PRESCRIÇÃO DE EXERCÍCIOS")
                    .setFont(fontBold)
                    .setFontSize(14)
                    .setFontColor(PRIMARY_DARK)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(16);
            doc.add(titulo);

            // ═══ INFO DO PACIENTE E PROFISSIONAL ═══
            Table infoTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                    .useAllAvailableWidth()
                    .setMarginBottom(16);

            // Coluna esquerda — Paciente
            Cell leftCell = new Cell().setBorder(Border.NO_BORDER).setPadding(8);
            leftCell.add(new Paragraph("PACIENTE").setFont(fontBold).setFontSize(9)
                    .setFontColor(PRIMARY_MID).setMarginBottom(4));
            leftCell.add(new Paragraph(prescricao.getPacienteNome())
                    .setFont(fontBold).setFontSize(13).setFontColor(PRIMARY_DARK));
            infoTable.addCell(leftCell);

            // Coluna direita — Profissional e Data
            Cell rightCell = new Cell().setBorder(Border.NO_BORDER).setPadding(8)
                    .setTextAlignment(TextAlignment.RIGHT);
            rightCell.add(new Paragraph("PROFISSIONAL").setFont(fontBold).setFontSize(9)
                    .setFontColor(PRIMARY_MID).setMarginBottom(4));
            rightCell.add(new Paragraph(prescricao.getProfissionalNome())
                    .setFont(fontBold).setFontSize(13).setFontColor(PRIMARY_DARK));
            rightCell.add(new Paragraph(prescricao.getDataPrescricao().format(DATE_FMT))
                    .setFont(fontRegular).setFontSize(10).setFontColor(GRAY_600).setMarginTop(4));
            infoTable.addCell(rightCell);

            doc.add(infoTable);

            // ═══ TÍTULO DA PRESCRIÇÃO ═══
            Div tituloBox = new Div()
                    .setBackgroundColor(BG_LIGHT)
                    .setPadding(14)
                    .setMarginBottom(20)
                    .setBorderLeft(new SolidBorder(PRIMARY_MID, 4));

            tituloBox.add(new Paragraph("Título").setFont(fontBold).setFontSize(9)
                    .setFontColor(PRIMARY_MID).setMarginBottom(4));
            tituloBox.add(new Paragraph(prescricao.getTitulo())
                    .setFont(fontBold).setFontSize(14).setFontColor(PRIMARY_DARK));
            doc.add(tituloBox);

            // ═══ DESCRIÇÃO DOS EXERCÍCIOS ═══
            doc.add(new Paragraph("Descrição dos Exercícios")
                    .setFont(fontBold).setFontSize(11).setFontColor(PRIMARY_DARK)
                    .setMarginBottom(8));

            // Processa quebras de linha do texto para parágrafos individuais
            String[] linhas = prescricao.getDescricaoExercicios().split("\\n");
            for (String linha : linhas) {
                String trimmed = linha.trim();
                if (trimmed.isEmpty()) {
                    doc.add(new Paragraph("").setMarginBottom(4));
                    continue;
                }
                doc.add(new Paragraph(trimmed)
                        .setFont(fontRegular).setFontSize(11).setFontColor(GRAY_600)
                        .setMultipliedLeading(1.6f).setMarginBottom(2));
            }

            doc.add(new Paragraph("").setMarginBottom(12));

            // ═══ OBSERVAÇÕES (SE HOUVER) ═══
            if (prescricao.getObservacoes() != null && !prescricao.getObservacoes().isBlank()) {
                Div obsBox = new Div()
                        .setBackgroundColor(new DeviceRgb(255, 251, 235)) // tea-100
                        .setPadding(14)
                        .setMarginBottom(20)
                        .setBorderLeft(new SolidBorder(new DeviceRgb(245, 158, 11), 4)); // tea-400

                obsBox.add(new Paragraph("Observações")
                        .setFont(fontBold).setFontSize(10).setFontColor(new DeviceRgb(180, 83, 9)) // tea-600
                        .setMarginBottom(6));

                String[] linhasObs = prescricao.getObservacoes().split("\\n");
                for (String l : linhasObs) {
                    if (!l.trim().isEmpty()) {
                        obsBox.add(new Paragraph(l.trim())
                                .setFont(fontRegular).setFontSize(10)
                                .setFontColor(GRAY_600).setMultipliedLeading(1.5f));
                    }
                }
                doc.add(obsBox);
            }

            // ═══ RODAPÉ ═══
            doc.add(new Paragraph("").setMarginTop(30));

            Table lineBottom = new Table(1).useAllAvailableWidth();
            lineBottom.addCell(new Cell().setBorder(Border.NO_BORDER)
                    .setBorderBottom(new SolidBorder(GRAY_400, 0.5f))
                    .setHeight(1));
            doc.add(lineBottom);

            // Assinatura
            doc.add(new Paragraph("").setMarginTop(40));

            Table assinaturaTable = new Table(1)
                    .setWidth(UnitValue.createPercentValue(50))
                    .setHorizontalAlignment(HorizontalAlignment.CENTER);

            Cell assinaturaCell = new Cell()
                    .setBorder(Border.NO_BORDER)
                    .setBorderTop(new SolidBorder(GRAY_600, 1))
                    .setPaddingTop(8)
                    .setTextAlignment(TextAlignment.CENTER);
            assinaturaCell.add(new Paragraph(prescricao.getProfissionalNome())
                    .setFont(fontBold).setFontSize(11).setFontColor(PRIMARY_DARK));
            assinaturaCell.add(new Paragraph("Fonoaudiólogo(a)")
                    .setFont(fontItalic).setFontSize(9).setFontColor(GRAY_600));
            assinaturaTable.addCell(assinaturaCell);
            doc.add(assinaturaTable);

            // Rodapé com data de geração
            doc.add(new Paragraph("").setMarginTop(20));
            doc.add(new Paragraph("Documento gerado pelo FonoSystem em " +
                    java.time.LocalDateTime.now().format(
                            DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm")))
                    .setFont(fontItalic).setFontSize(8).setFontColor(GRAY_400)
                    .setTextAlignment(TextAlignment.CENTER));

            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF da prescrição", e);
        }
    }
}
