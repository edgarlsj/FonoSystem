package br.com.fonosystem.service;

import br.com.fonosystem.model.Anamnese;
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
            Paragraph header = new Paragraph("🧩 Live System")
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
            Paragraph titulo = new Paragraph("PRESCRIÇÃO")
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

            // ═══ CONTEÚDO DA PRESCRIÇÃO ═══
            doc.add(new Paragraph("Conteúdo da Prescrição")
                    .setFont(fontBold).setFontSize(11).setFontColor(PRIMARY_DARK)
                    .setMarginBottom(8));

            Div conteudoBox = new Div()
                    .setBackgroundColor(BG_LIGHT)
                    .setPadding(16)
                    .setMarginBottom(20)
                    .setBorderLeft(new SolidBorder(PRIMARY_MID, 3));

            String[] linhas = prescricao.getDescricaoExercicios().split("\\n");
            for (String linha : linhas) {
                String trimmed = linha.trim();
                if (trimmed.isEmpty()) {
                    conteudoBox.add(new Paragraph("").setMarginBottom(4));
                    continue;
                }
                conteudoBox.add(new Paragraph(trimmed)
                        .setFont(fontRegular).setFontSize(11).setFontColor(GRAY_600)
                        .setMultipliedLeading(1.7f).setMarginBottom(2));
            }
            doc.add(conteudoBox);

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
            if (prescricao.getProfissionalConselho() != null && !prescricao.getProfissionalConselho().isBlank()) {
                assinaturaCell.add(new Paragraph(prescricao.getProfissionalConselho())
                        .setFont(fontRegular).setFontSize(9).setFontColor(GRAY_600).setMarginTop(2));
            }
            assinaturaCell.add(new Paragraph("Fonoaudiólogo(a)")
                    .setFont(fontItalic).setFontSize(9).setFontColor(GRAY_600));
            assinaturaTable.addCell(assinaturaCell);
            doc.add(assinaturaTable);

            // Rodapé com data de geração
            doc.add(new Paragraph("").setMarginTop(20));
            doc.add(new Paragraph("Documento gerado pelo Live System em " +
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

    public byte[] gerarAnamnesePdf(Anamnese anamnese) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf, PageSize.A4);
            doc.setMargins(40, 50, 40, 50);

            PdfFont fontBold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont fontRegular = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont fontItalic = PdfFontFactory.createFont(StandardFonts.HELVETICA_OBLIQUE);

            // ═══ CABEÇALHO ═══
            Paragraph header = new Paragraph("🧩 Live System")
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
            Paragraph titulo = new Paragraph("ANAMNESE")
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
            leftCell.add(new Paragraph(anamnese.getPacienteNome())
                    .setFont(fontBold).setFontSize(13).setFontColor(PRIMARY_DARK));
            if (anamnese.getPacienteDataNascimento() != null) {
                leftCell.add(new Paragraph("Data de nascimento: " + anamnese.getPacienteDataNascimento().format(DATE_FMT))
                        .setFont(fontRegular).setFontSize(9).setFontColor(GRAY_600).setMarginTop(4));
            }
            infoTable.addCell(leftCell);

            // Coluna direita — Profissional e Data
            Cell rightCell = new Cell().setBorder(Border.NO_BORDER).setPadding(8)
                    .setTextAlignment(TextAlignment.RIGHT);
            rightCell.add(new Paragraph("PROFISSIONAL").setFont(fontBold).setFontSize(9)
                    .setFontColor(PRIMARY_MID).setMarginBottom(4));
            rightCell.add(new Paragraph(anamnese.getProfissionalNome())
                    .setFont(fontBold).setFontSize(13).setFontColor(PRIMARY_DARK));
            rightCell.add(new Paragraph("Data: " + anamnese.getCreatedAt().format(
                    DateTimeFormatter.ofPattern("dd/MM/yyyy", new Locale("pt", "BR"))))
                    .setFont(fontRegular).setFontSize(10).setFontColor(GRAY_600).setMarginTop(4));
            infoTable.addCell(rightCell);

            doc.add(infoTable);

            // ═══ SEÇÕES DE ANAMNESE ═══
            adicionarSecaoAnamnese(doc, "Queixa Principal", anamnese.getQueixaPrincipal(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Histórico Clínico", anamnese.getHistoricoClinico(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Histórico Familiar", anamnese.getHistoricoFamiliar(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Desenvolvimento da Linguagem", anamnese.getDesenvolvimentoLinguagem(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Desenvolvimento Motor", anamnese.getDesenvolvimentoMotor(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Diagnóstico TEA", anamnese.getDiagnosticoTea(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Nível do Espectro", anamnese.getNivelEspectro(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Usa CAA", anamnese.getUsaCaa(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Tipo de CAA", anamnese.getTipoCaa(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Hipersensibilidades", anamnese.getHipersensibilidades(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Profissionais que Acompanham", anamnese.getProfissionaisAcompanham(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Frequenta Escola", anamnese.getFrequentaEscola(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Tipo de Perda Auditiva", anamnese.getTipoPerdaAuditiva(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Grau da Perda", anamnese.getGrauPerda(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Usa Dispositivo", anamnese.getUsaDispositivo(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Tipo de Dispositivo", anamnese.getTipoDispositivo(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Data de Ativação", anamnese.getDataAtivacao() != null ? anamnese.getDataAtivacao().format(DATE_FMT) : "", fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Marca e Modelo", anamnese.getMarcaModelo(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Alergias", anamnese.getAlergias(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Medicações", anamnese.getMedicacoes(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Nome da Mãe", anamnese.getNomeMae(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Data de Nascimento da Mãe", anamnese.getDataNascMae(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Telefone da Mãe", anamnese.getTelefoneMae(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Profissão da Mãe", anamnese.getProfissaoMae(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Nome do Pai", anamnese.getNomePai(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Data de Nascimento do Pai", anamnese.getDataNascPai(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Telefone do Pai", anamnese.getTelefonePai(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Profissão do Pai", anamnese.getProfissaoPai(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Irmãos", anamnese.getIrmaos(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Outros Familiares", anamnese.getOutrosFamiliares(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Período com Cuidadores", anamnese.getPeriodoCuidadores(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Semanas de Gestação", anamnese.getSemanasGestacao(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Tipo de Parto", anamnese.getTipoParto(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Intercorrências do Parto", anamnese.getIntercorrenciasParto(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Teste da Orelhinha", anamnese.getTesteOrelhinha(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Teste da Linguinha", anamnese.getTesteLinguinha(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Amamentação e Chupeta", anamnese.getAmamentacaoChupeta(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Histórico de Perda Auditiva", anamnese.getHistPerdaAuditiva() != null ? (anamnese.getHistPerdaAuditiva() ? "Sim" : "Não") : "", fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Histórico de Transtornos Neurológicos", anamnese.getHistTranstornosNeurologicos() != null ? (anamnese.getHistTranstornosNeurologicos() ? "Sim" : "Não") : "", fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Histórico de Convulsões", anamnese.getHistConvulsoes() != null ? (anamnese.getHistConvulsoes() ? "Sim" : "Não") : "", fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Histórico de Malformação Fetal", anamnese.getHistMalformacaoFetal() != null ? (anamnese.getHistMalformacaoFetal() ? "Sim" : "Não") : "", fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Histórico de Gagueira", anamnese.getHistGagueira() != null ? (anamnese.getHistGagueira() ? "Sim" : "Não") : "", fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Outros Históricos", anamnese.getHistOutros(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Idade - Firmou Pescoço", anamnese.getIdadeFirmouPescoco(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Idade - Sentou", anamnese.getIdadeSentou(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Idade - Engatinhou", anamnese.getIdadeEngatinhou(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Idade - Andou", anamnese.getIdadeAndou(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Mão de Referência", anamnese.getMaoReferencia(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Anda na Ponta do Pé", anamnese.getAndaPontaPe(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Autonomia para Vestir", anamnese.getAutonomiaVestir(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Senta em W", anamnese.getSentaW(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Idade - Balbucio", anamnese.getIdadeBalbuciou(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Idade - Primeiras Palavras", anamnese.getIdadePrimeirasPalavras(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Gagueja", anamnese.getGagueja(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Comunicação Atual", anamnese.getComunicacaoAtual(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Trocas de Fala", anamnese.getTrocasFala(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Rotina de Sono", anamnese.getRotinaSono(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Rotina de Alimentação", anamnese.getRotinaAlimentacao(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Restrição Alimentar", anamnese.getRestricaoAlimentar(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Rotina de Socialização", anamnese.getRotinaSocializacao(), fontBold, fontRegular);
            adicionarSecaoAnamnese(doc, "Observações", anamnese.getObservacoes(), fontBold, fontRegular);

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
            assinaturaCell.add(new Paragraph(anamnese.getProfissionalNome())
                    .setFont(fontBold).setFontSize(11).setFontColor(PRIMARY_DARK));
            assinaturaCell.add(new Paragraph("Fonoaudiólogo(a)")
                    .setFont(fontItalic).setFontSize(9).setFontColor(GRAY_600));
            assinaturaTable.addCell(assinaturaCell);
            doc.add(assinaturaTable);

            // Rodapé com data de geração
            doc.add(new Paragraph("").setMarginTop(20));
            doc.add(new Paragraph("Documento gerado pelo Live System em " +
                    java.time.LocalDateTime.now().format(
                            DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm")))
                    .setFont(fontItalic).setFontSize(8).setFontColor(GRAY_400)
                    .setTextAlignment(TextAlignment.CENTER));

            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF da anamnese", e);
        }
    }

    private void adicionarSecaoAnamnese(Document doc, String titulo, String conteudo,
                                       PdfFont fontBold, PdfFont fontRegular) {
        if (conteudo == null || conteudo.isBlank()) {
            return;
        }

        doc.add(new Paragraph(titulo)
                .setFont(fontBold).setFontSize(11).setFontColor(PRIMARY_DARK)
                .setMarginBottom(4).setMarginTop(12));

        String[] linhas = conteudo.split("\\n");
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
    }
}
