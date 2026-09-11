using System.IO.Compression;
using System.Text;
using System.Xml.Linq;
using HukukUyum.API.DTOs.Reports;

namespace HukukUyum.API.Services;

public static class ReportWorkbook
{
    // Inline strings keep user-supplied names as text, never spreadsheet formulas.
    public static byte[] Create(string title, ReportSummaryDto report, GroupReportDto? group = null)
    {
        var rows = new List<object[]>
        {
            new object[] { title },
            new object[] { "Rapor zamanı (UTC)", DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm") },
            new object[] { "Kapsam", group is null ? "Erişilebilir tüm görevler" : group.GroupName },
            new object[] { "Hesaplama", "Silinen görevler hariç. Gecikmiş görevler aktif görevlerin alt kümesidir." },
            new object[] { "Gösterge", "Adet" },
            new object[] { "Toplam", report.TotalTasks },
            new object[] { "Yeni", report.NewTasks },
            new object[] { "Devam eden", report.InProgressTasks },
            new object[] { "Beklemede", report.OnHoldTasks },
            new object[] { "Aktif", report.ActiveTasks },
            new object[] { "Tamamlanan", report.CompletedTasks },
            new object[] { "İptal", report.CancelledTasks },
            new object[] { "Gecikmiş", report.OverdueTasks },
            new object[] { "Atama bekleyen", report.AwaitingAssignmentTasks },
            new object[] { "Düşük öncelik", report.LowPriorityTasks },
            new object[] { "Orta öncelik", report.MediumPriorityTasks },
            new object[] { "Yüksek öncelik", report.HighPriorityTasks },
            new object[] { "Kritik öncelik", report.CriticalPriorityTasks },
            new object[] { "Kişiye atanan", report.UserAssignedTasks },
            new object[] { "Gruba atanan", report.GroupAssignedTasks }
        };
        if (group is not null)
        {
            rows.Add(new object[] { "Yönetici", group.ManagerName ?? "Belirlenmemiş" });
            rows.Add(new object[] { "Üye sayısı", group.MemberCount });
            rows.Add(Array.Empty<object>());
            rows.Add(new object[] { "Çalışan", "Aktif", "Tamamlanan", "Gecikmiş", "Güncel üyelik" });
            rows.AddRange(group.Members.Select(m => new object[] {
                m.FullName, m.ActiveTasks, m.CompletedTasks, m.OverdueTasks, m.IsCurrentMember ? "Evet" : "Hayır" }));
        }
        XNamespace sheet = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
        var lastColumn = group is null ? "B" : "E";
        var merges = new XElement(sheet + "mergeCells",
            new XElement(sheet + "mergeCell", new XAttribute("ref", $"A1:{lastColumn}1")));
        if (group is not null)
            for (var row = 2; row <= 4; row++)
                merges.Add(new XElement(sheet + "mergeCell", new XAttribute("ref", $"B{row}:E{row}")));
        var data = new XElement(sheet + "sheetData", rows.Select((row, index) =>
        {
            var heading = index == 4 || (row.Length > 0 && Equals(row[0], "Çalışan"));
            var element = new XElement(sheet + "row", new XAttribute("r", index + 1),
                new XAttribute("ht", index == 0 ? 38 : index == 3 ? 60 : heading ? 30 : 26),
                new XAttribute("customHeight", 1));
            for (var column = 0; column < (group is null ? 2 : 5); column++)
            {
                var value = column < row.Length ? row[column] : "";
                var style = index == 0 ? 1 : heading ? 2 : index < 4 ? 3 :
                    value is int ? (index % 2 == 0 ? 6 : 7) : (index % 2 == 0 ? 4 : 5);
                element.Add(new XElement(sheet + "c",
                    new XAttribute("r", ((char)('A' + column)).ToString() + (index + 1)),
                    new XAttribute("s", style), new XAttribute("t", value is int ? "n" : "inlineStr"),
                    value is int number ? new XElement(sheet + "v", number) :
                        new XElement(sheet + "is", new XElement(sheet + "t", value.ToString()))));
            }
            return element;
        }));
        using var output = new MemoryStream();
        using (var zip = new ZipArchive(output, ZipArchiveMode.Create, true))
        {
            void Add(string path, string xml)
            {
                using var writer = new StreamWriter(zip.CreateEntry(path).Open(), new UTF8Encoding(false));
                writer.Write(xml);
            }
            Add("xl/styles.xml", """
                <styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
                  <fonts count="4">
                    <font><sz val="11"/><color rgb="FF20354D"/><name val="Calibri"/></font>
                    <font><b/><sz val="20"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
                    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
                    <font><b/><sz val="12"/><color rgb="FF193E68"/><name val="Calibri"/></font>
                  </fonts>
                  <fills count="5">
                    <fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>
                    <fill><patternFill patternType="solid"><fgColor rgb="FF193E68"/><bgColor indexed="64"/></patternFill></fill>
                    <fill><patternFill patternType="solid"><fgColor rgb="FFF0F5FA"/><bgColor indexed="64"/></patternFill></fill>
                    <fill><patternFill patternType="solid"><fgColor rgb="FFFFFFFF"/><bgColor indexed="64"/></patternFill></fill>
                  </fills>
                  <borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>
                    <border><left/><right/><top/><bottom style="hair"><color rgb="FFDCE5EF"/></bottom><diagonal/></border>
                  </borders>
                  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
                  <cellXfs count="8">
                    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
                    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" indent="1"/></xf>
                    <xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" indent="1"/></xf>
                    <xf numFmtId="0" fontId="0" fillId="3" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1" indent="1"/></xf>
                    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1" indent="1"/></xf>
                    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1" indent="1"/></xf>
                    <xf numFmtId="3" fontId="3" fillId="3" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="center" horizontal="center"/></xf>
                    <xf numFmtId="3" fontId="3" fillId="4" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="center" horizontal="center"/></xf>
                  </cellXfs>
                  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
                </styleSheet>
                """);
            Add("[Content_Types].xml", """<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>""");
            Add("_rels/.rels", """<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>""");
            Add("xl/workbook.xml", """<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Rapor" sheetId="1" r:id="rId1"/></sheets></workbook>""");
            Add("xl/_rels/workbook.xml.rels", """<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>""");
            Add("xl/worksheets/sheet1.xml", new XElement(sheet + "worksheet",
                new XElement(sheet + "sheetViews", new XElement(sheet + "sheetView",
                    new XAttribute("workbookViewId", 0), new XAttribute("showGridLines", 0),
                    new XElement(sheet + "pane", new XAttribute("ySplit", 5), new XAttribute("topLeftCell", "A6"),
                        new XAttribute("activePane", "bottomLeft"), new XAttribute("state", "frozen")))),
                new XElement(sheet + "cols",
                    new XElement(sheet + "col", new XAttribute("min", 1), new XAttribute("max", 1), new XAttribute("width", 40), new XAttribute("customWidth", 1)),
                    new XElement(sheet + "col", new XAttribute("min", 2), new XAttribute("max", group is null ? 2 : 5), new XAttribute("width", group is null ? 60 : 22), new XAttribute("customWidth", 1))), data, merges,
                new XElement(sheet + "printOptions", new XAttribute("horizontalCentered", 1)),
                new XElement(sheet + "pageMargins", new XAttribute("left", 0.3), new XAttribute("right", 0.3),
                    new XAttribute("top", 0.5), new XAttribute("bottom", 0.5), new XAttribute("header", 0.2), new XAttribute("footer", 0.2)),
                new XElement(sheet + "pageSetup", new XAttribute("paperSize", 9), new XAttribute("orientation", group is null ? "portrait" : "landscape"))
                ).ToString());
        }
        return output.ToArray();
    }
}
