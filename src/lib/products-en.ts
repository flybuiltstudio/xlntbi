/**
 * English short summaries for the product cards on the English products page.
 * One faithful, concise translation per product slug, derived from the
 * Hungarian `intro[0]` text in `products.ts`.
 */
export const PRODUCT_SUMMARY_EN: Record<string, string> = {
  "nav-online-szamla-letolto":
    "The XLNT NAV Online Invoice Downloader is a convenient desktop tool that lets you query and save invoice data from the NAV (Hungarian Tax Authority) Online Invoice system in a few clicks, speeding up daily admin and producing a tidy Excel file that can even be imported into your accounting software.",
  "nav-penztargep-letolto":
    "The XLNT NAV Cash Register Downloader is a practical desktop tool that quickly and transparently queries and saves cash-register data, handling the queries, saving and processing in one place for a clean, reliable, and easy-to-use output.",
  "afa-ev65-xml-generalo":
    "The xlntbi.hu ev65 XML generator is a standalone Windows desktop app that, from your accounting software's data, produces with one click the ÁNYK-compatible XML file needed for the M sheets of the NAV ev65 VAT return, eliminating manual copying, typos and skipped rows.",
  "ugyfelkapu-totp-manager":
    "For accountants, auditors and tax advisors who regularly log into several clients' Ügyfélkapu+ (Client Gateway) accounts, the XLNT Ügyfélkapu+ TOTP Manager ends the daily routine of opening an authenticator app: a single Excel sheet shows every client's login data and the currently valid code, copyable to the clipboard in one click.",
  "a60-osszesito-nyilatkozat-xml":
    "Besides the VAT return, EU transactions also require a summary statement (A60), which even the eÁFA system does not replace; filling it in via ÁNYK is slow and partner EU VAT numbers must be checked separately. The A60 XML tool speeds this up: items are entered into a clear Excel table, from which the program generates the ÁNYK-importable form.",
  "adofolyoszamla-egyezteto":
    "One of the recurring, time-consuming closing tasks is reconciling the tax current account with the general ledger. This tool reads in the NAV statement, collects the ledger balances, and shows by tax type where the two differ – all in a single Excel workbook, with no installation and no cloud.",
  "nav-torzsszam-partnerellenorzo":
    "If you check business partners daily as an accountant or entrepreneur, you normally do this by clicking through three different websites. This workbook brings all three into one Excel table: the official tax-number check from the NAV (Hungarian Tax Authority) Online Invoice system, the European Commission's VIES service, and, optionally, a company-name search.",
  "berszamfejto":
    "The same routine every month: calculate gross pay, allowances and contributions, then manually retype the numbers into the ÁNYK 08 return. XLNT Payroll takes both steps off your hands: it does the payroll calculation in a familiar Excel workbook, then produces the ÁNYK-importable XML with a single click.",
  "utalasi-csomag-keszito":
    "If you transfer money to several partners every month, you know the tedious task of typing each item into online banking one by one. This Excel tool takes that off your hands: you list the items in a clear table, and the program creates a ready bank import file that you just load into your online banking, check and sign.",
  "beszamolo":
    "During closing season, most of the time is spent moving data between the ledger, the balance sheet, the tax calculation, the tax returns and the notes to the accounts. This file connects that whole chain: you upload the trial balance once, and the financial statements, notes, the OBR file, the corporate tax or KIVA return and the local business tax return are all produced from the same data set.",
  "cegkivonat-excel-konverter":
    "If you have ever manually copied a Hungarian company extract's data into Excel, you know how long it takes. This program automatically extracts all the data from the PDF and turns it into a clear, ready-to-use Excel file.",
  "havi-riport":
    "One import, more than 25 finished report sheets. Load the trial balance or the ledger export from your accounting software, press one button, and the workbook fills the balance sheet, the income statement (annual, simplified and monthly), the cash flow, the receivables and payables ageing, the VAT summary, the dashboard and the notes-to-the-accounts detail sheets – all in Excel on your own computer, with no data connection and no monthly fee.",
  "havi-riport-en":
    "One import, more than 25 finished report sheets. Load the trial balance or the ledger export of your accounting software, press one button, and the workbook fills the balance sheet, the income statement (annual, simplified and monthly), the cash flow, the receivables and payables ageing, the VAT summary, the dashboard and the notes-to-the-accounts detail sheets – all in the Excel on your own machine, with no data connection and no monthly fee.",
  "kamatlekerdezo-potlekszamito":
    "If you work as an accountant or tax advisor, you likely know the situation: calculating a late-payment or self-revision penalty first requires looking up the central bank base rate valid for the given period, then working through the statutory formula day by day. This workbook takes that step off your hands.",
  "utnyilvantartas-kikuldetesi-rendelveny":
    "A single, carefully built Excel file for preparing own-vehicle and business-trip settlements according to current Hungarian rules, in both Hungarian and English. A whole month fits on one sheet, even with several trips; days, exchange rates and posting entries are calculated automatically. No monthly fee: download it and use it for your next settlement.",
  "szamviteli-konszolidalo":
    "A consolidated annual financial statement in Excel — step by step, with built-in reconciliation checks, in both Hungarian and English. The hard part of consolidation is structure and balancing; the program takes this off your hands: the balance sheet, income statement and cash flow follow the statutory templates and are ready to use, adjustments go into a single journal from which the statements are assembled automatically, with built-in balance checks.",
  "ifrs-konszolidalo":
    "Consolidated IFRS financial statements in Excel – with the mandatory subtotals of IFRS 18, in both Hungarian and English (IFRS 10, IFRS 3, IAS 28, IAS 21, IAS 36, IAS 7, IFRS 18). The workbook is built on presentation under IFRS 18 (Presentation and Disclosure in Financial Statements), effective from periods beginning on or after 1 January 2027, replacing IAS 1.",
  "kulcs-soft-kulfoldi-szamla-import":
    "If you regularly book incoming invoices from the EU or third countries in the Kulcs-Soft accounting system, this tool can simplify your work: you record the data in Excel, and one click produces a ready importable CSV file.",
  "novitax-kulfoldi-szamla-import":
    "If you regularly book incoming invoices from the EU or third countries in the Novitax accounting system, this tool takes over the manual data-entry work: you record the invoices in Excel, and one click produces a ready importable CSV file.",
  "penzszam-kulfoldi-szamla-import":
    "If you regularly book incoming invoices from the EU or third countries in the PÉNZSZÁM accounting system, this tool takes over the manual data-entry work. Partners are imported directly from PÉNZSZÁM, invoices are recorded in Excel, and one click produces a CSV file with exactly 84 fields and the required control row.",
  "pdf-excel-konverter":
    "Most PDF-to-Excel converters just dump the raw text, with no formatting or structure. This program works differently: it keeps the font size, highlighting, table structure and embedded images, so the resulting Excel file actually resembles the original document, and it also works on scanned PDFs using built-in OCR in Hungarian and English.",
  "rlb-bank-konverter-pro":
    "The PRO version goes far beyond a basic converter: it does not just convert, it prepares bank transactions according to accounting logic. It recognises NAV (Hungarian Tax Authority) payments, wages and bank charges, reconciles bank and accounting partner names, and generates a clear Excel summary for every converted statement, including from PDF files with OCR support.",
  "rlb-bank-konverter":
    "As accounting work covers more and more banks, financial service providers and export formats, one of the hardest tasks is producing uniform, cleanly importable bank data for RLB. This tool takes over work that used to be done manually, line by line, loading up to ten differently formatted files at once and converting them into RLB-readable CSV with one click.",
  "rlb-kulfoldi-szamla-import":
    "Book EU and third-country supplier invoices from Excel directly into the RLB system, without manual retyping. This tool is built for accounting firms that regularly handle foreign-currency incoming invoices and want to save time on data entry.",
  "rlb-nyito-vegyes-konyvelo":
    "Upload your general ledger data and the program produces the ready RLB miscellaneous import file – month-end miscellaneous postings and opening balances are among the most time-consuming, manual tasks, and this Excel-based tool solves them: you paste or enter the items, and the program creates the RLB-readable import file without typing, renumbering or matching mirror lines.",
  "kulcs-nyito-vegyes-konyvelo":
    "Upload your general ledger data and the program produces the ready Kulcs-Könyvelés miscellaneous import file – month-end miscellaneous postings and opening balances are among the most time-consuming, manual tasks, and this Excel-based tool solves them without typing, renumbering or matching mirror lines.",
  "sup-nyito-vegyes-konyvelo":
    "Upload your general ledger data and the program produces the ready Qsoft SUP miscellaneous import file – month-end miscellaneous postings and opening balances are among the most time-consuming, manual tasks, and this Excel-based tool solves them without typing, renumbering or matching mirror lines.",
  "telefonszamla-konyvelo":
    "Booking company phone bills with several numbers is the same tiring, error-prone manual work month after month. The Phone Bill Bookkeeper reads the PDF invoice, splits the items by phone number, and with one click creates a file importable into your accounting software, with correct VAT rates and the private/business VAT split for phone services, automatically recognising Magyar Telekom and Yettel business mobile invoices.",
  "univerzalis-bank-konverter":
    "One of the biggest time sinks for accounting firms and businesses is the manual or semi-manual entry of monthly bank statements; this tool automates the conversion of bank statements.",
  "wifi-jelszo-nezo":
    "New phone, new laptop, a guest at the office – and the Wi-Fi password has long been forgotten. The XLNT Wi-Fi Password Viewer collects and displays, in a clear list, all the Wi-Fi passwords this computer has previously saved. No registration, no complicated installation: just run it and see.",
  "auditxml-ellenorzo-javito":
    "A small, standalone Windows helper tool that quickly checks AuditXML and NAV (Hungarian Tax Authority) invoice data-export files, and – after separate confirmation – fixes the most common, mechanically fixable errors: broken accented characters, wrong encoding, fields that are too long, comma decimal separators, and incorrect date formats. Anything that cannot be safely fixed is simply flagged.",
  "devizabank":
    "Under Hungarian accounting law, decreasing items of a foreign-currency bank account may only be accounted for using the FIFO or average-price method – a rule confirmed by the 2022 Chamber of Auditors' presentations on 'Assets' and 'Liabilities'. In practice, few programs, and even fewer Excel templates, handle correctly the situation when a foreign-currency account balance crosses zero or goes negative; this tool was built by a developer experienced with most Hungarian and international accounting programs.",
  "mnb-era-jelentesgenerator":
    "Submitting the R09 and R12 reports required by the MNB (Hungarian central bank) via the ERA/STEFI system is bound by strict format rules: a prescribed file name, XML schema or row-coded CSV structure, and exact date and number formats. Manual assembly is slow and error-prone – a single misplaced comma or date code can cause the whole report to be rejected. The MNB ERA Report Generator is two Excel templates with matching VBA macros that turn data entered in a familiar spreadsheet into a submittable report following the official STEFI user manual.",
  "ingatlanalap-mnb-jelentes-elokeszito":
    "Fund managers running a real estate fund must report quarterly on changes in the fund's real estate exposure (report 51M) and must also regularly determine and report the fund's net asset value (report 50A). The two reports are linked in content – tracking that link manually is time-consuming and error-prone. The Real Estate Fund MNB Report Preparer combines the real estate register, the net asset value calculation and the submittable report file in a single Excel workbook.",
  "vallalkozas-meret-besorolo":
    "The Business Size Classification Excel calculator helps you see at a glance the likely SME category of a business based on headcount, net revenue and balance sheet total. The workbook handles the year-end and the first-day-of-the-year perspective on separate sheets, so it is a practical starting point for reviewing the innovation contribution, certain corporate tax reliefs and SME status. Yellow input cells, automatic HUF thresholds from the MNB EUR/HUF rate, and Hungarian and English background notes are included.",
  "kapcsoltsag-ellenorzo":
    "Assessing related-party status is often difficult because the Corporate Tax Act, the Accounting Act and the SME Act use different definitions and thresholds for the same ownership or control situation. The Related-Party Checker uses the data you enter to show, separately, whether businesses are related or affiliated according to the logic of each of the three laws.",
};

/**
 * Returns the English summary for the given product slug, falling back to
 * the provided text (typically the Hungarian intro) when no translation
 * exists yet.
 */
export function productSummaryEn(slug: string, fallback: string): string {
  return PRODUCT_SUMMARY_EN[slug] ?? fallback;
}
