/**
 * Ready-made content (job titles, achievement bullets, skills, summaries) offered in the editor.
 * Written per CV language (pl, en); other languages fall back to English. Keep phrases factual and
 * easy to adapt – users click to insert, then edit numbers.
 */
export type Field = 'marketing' | 'sales' | 'it' | 'customer' | 'admin' | 'finance' | 'logistics' | 'hr' | 'healthcare' | 'general';
export const FIELDS: Field[] = ['marketing', 'sales', 'it', 'customer', 'admin', 'finance', 'logistics', 'hr', 'healthcare', 'general'];

interface Bank {
  titles: string[];
  bullets: Record<Field, string[]>;
  skills: Record<Field, string[]>;
  summaries: Record<Field, string[]>;
}

const KEYWORDS: Record<Exclude<Field, 'general'>, string[]> = {
  marketing: ['marketing', 'social', 'content', 'seo', 'sem', 'brand', 'pr ', 'copywrit', 'reklam', 'kampan', 'e-commerce', 'ecommerce'],
  sales: ['sprzeda', 'sales', 'handlow', 'account', 'key account', 'doradca klienta', 'przedstawiciel', 'business development'],
  it: ['develop', 'program', 'engineer', 'inżynier', 'software', 'java', 'frontend', 'backend', 'devops', 'tester', 'qa', 'data', 'analityk', 'it ', 'admin systemów', 'sysadmin', 'web'],
  customer: ['obsług', 'customer', 'kasjer', 'cashier', 'call center', 'helpdesk', 'support', 'recepcj', 'reception', 'sprzedawca', 'barista', 'kelner', 'waiter'],
  admin: ['administr', 'biur', 'office', 'asystent', 'assistant', 'sekretar', 'secretary', 'koordynator', 'coordinator'],
  finance: ['księg', 'account', 'finans', 'finance', 'kontroling', 'controller', 'audyt', 'audit', 'płac', 'payroll'],
  logistics: ['magazyn', 'warehouse', 'logisty', 'logistic', 'kierowca', 'driver', 'spedy', 'zaopatrz', 'supply', 'operator wózka', 'forklift', 'produkc'],
  hr: ['hr', 'rekrut', 'recruit', 'kadr', 'personel', 'talent', 'people'],
  healthcare: ['pielęg', 'nurse', 'lekarz', 'doctor', 'medycz', 'medical', 'ratownik', 'paramedic', 'opiekun', 'carer', 'farmac', 'pharmac', 'fizjoterap'],
};

/** Best-matching field for a job title / headline (falls back to 'general'). */
export function detectField(...texts: string[]): Field {
  const t = ' ' + texts.join(' ').toLowerCase() + ' ';
  let best: Field = 'general';
  let score = 0;
  for (const [field, words] of Object.entries(KEYWORDS) as [Field, string[]][]) {
    const s = words.reduce((n, w) => (t.includes(w) ? n + 1 : n), 0);
    if (s > score) {
      score = s;
      best = field;
    }
  }
  return best;
}

const PL: Bank = {
  titles: ['Specjalista ds. marketingu', 'Specjalista ds. sprzedaży', 'Przedstawiciel handlowy', 'Kierownik sprzedaży', 'Programista Java', 'Frontend Developer', 'Tester oprogramowania', 'Analityk danych', 'Konsultant ds. obsługi klienta', 'Kasjer', 'Sprzedawca', 'Recepcjonista', 'Asystent biura', 'Specjalista ds. administracji', 'Księgowy', 'Specjalista ds. płac', 'Magazynier', 'Kierowca kat. C', 'Specjalista ds. logistyki', 'Specjalista ds. rekrutacji', 'Specjalista ds. kadr i płac', 'Pielęgniarka', 'Opiekun osoby starszej', 'Kierownik projektu', 'Grafik', 'Kelner', 'Barista'],
  bullets: {
    marketing: ['Planowałem i prowadziłem kampanie Google Ads i Meta Ads, zwiększając liczbę leadów o 35%', 'Tworzyłem treści na bloga i media społecznościowe, podwajając zasięgi organiczne w ciągu roku', 'Analizowałem wyniki działań w Google Analytics 4 i przygotowywałem miesięczne raporty', 'Optymalizowałem stronę pod SEO, poprawiając pozycje 40 kluczowych fraz', 'Koordynowałem współpracę z agencjami i influencerami', 'Przygotowywałem kampanie e-mail marketingowe z otwieralnością powyżej 30%', 'Prowadziłem testy A/B landing page, zwiększając konwersję o 18%', 'Zarządzałem miesięcznym budżetem marketingowym i kontrolowałem ROI'],
    sales: ['Zrealizowałem 120% rocznego planu sprzedaży', 'Pozyskałem 40 nowych klientów biznesowych w ciągu roku', 'Prowadziłem negocjacje handlowe i zamykałem kontrakty o wartości do 500 tys. zł', 'Budowałem długofalowe relacje z kluczowymi klientami', 'Przygotowywałem oferty i prezentacje produktowe dopasowane do potrzeb klienta', 'Prowadziłem lejek sprzedażowy w CRM i raportowałem prognozy', 'Rozwijałem sprzedaż w nowym regionie od zera', 'Szkoliłem nowych handlowców z technik sprzedaży'],
    it: ['Projektowałem i rozwijałem REST API w Javie i Spring Boot', 'Tworzyłem responsywne interfejsy w Angularze i TypeScript', 'Skróciłem czas odpowiedzi aplikacji o 40% dzięki optymalizacji zapytań SQL', 'Pisałem testy jednostkowe i integracyjne, utrzymując pokrycie powyżej 80%', 'Wdrażałem aplikacje w chmurze (AWS) z wykorzystaniem Dockera i CI/CD', 'Przeprowadzałem code review i dzieliłem się wiedzą w zespole', 'Współpracowałem z Product Ownerem w metodyce Scrum', 'Automatyzowałem procesy, oszczędzając zespołowi 10 godzin tygodniowo'],
    customer: ['Obsługiwałem średnio 80 klientów dziennie, utrzymując ocenę satysfakcji 4,8/5', 'Rozwiązywałem reklamacje i zgłoszenia klientów telefonicznie i mailowo', 'Obsługiwałem kasę fiskalną i terminal płatniczy, rozliczałem zmianę bez rozbieżności', 'Doradzałem klientom w wyborze produktów, zwiększając sprzedaż dodatkową', 'Dbałem o ekspozycję towaru i porządek na sali sprzedaży', 'Przyjmowałem i wydawałem towar oraz kontrolowałem stany', 'Wprowadzałem nowych pracowników w standardy obsługi', 'Prowadziłem dokumentację zgłoszeń w systemie CRM'],
    admin: ['Koordynowałem pracę biura i kalendarze zarządu', 'Prowadziłem obieg dokumentów i korespondencję firmową', 'Organizowałem spotkania, podróże służbowe i wydarzenia firmowe', 'Przygotowywałem raporty i zestawienia w Excelu', 'Zamawiałem materiały biurowe i współpracowałem z dostawcami', 'Wdrożyłem elektroniczny obieg faktur, skracając czas akceptacji o połowę', 'Obsługiwałem recepcję i centralę telefoniczną', 'Archiwizowałem dokumenty zgodnie z procedurami i RODO'],
    finance: ['Prowadziłem pełną księgowość dla 15 podmiotów', 'Przygotowywałem deklaracje VAT, CIT i PIT', 'Sporządzałem miesięczne i roczne sprawozdania finansowe', 'Uzgadniałem rozrachunki z kontrahentami i bankami', 'Naliczałem wynagrodzenia i składki ZUS dla 120 pracowników', 'Współpracowałem z audytorami podczas badania sprawozdań', 'Przygotowywałem budżety i analizy odchyleń', 'Automatyzowałem raporty w Excelu, skracając zamknięcie miesiąca o 3 dni'],
    logistics: ['Przyjmowałem, kompletowałem i wydawałem towar zgodnie z WMS', 'Obsługiwałem wózek widłowy (UDT) i skaner magazynowy', 'Kompletowałem średnio 300 zamówień dziennie bez błędów', 'Przeprowadzałem inwentaryzacje i kontrolę stanów magazynowych', 'Planowałem trasy i terminy dostaw', 'Koordynowałem współpracę z przewoźnikami i spedytorami', 'Dbałem o przestrzeganie zasad BHP na magazynie', 'Usprawniłem rozmieszczenie towaru, skracając czas kompletacji o 15%'],
    hr: ['Prowadziłem pełne procesy rekrutacyjne od ogłoszenia do zatrudnienia', 'Zatrudniłem ponad 60 osób w ciągu roku', 'Prowadziłem dokumentację kadrową i ewidencję czasu pracy', 'Organizowałem onboarding i szkolenia dla nowych pracowników', 'Współtworzyłem politykę wynagrodzeń i system ocen okresowych', 'Prowadziłem działania employer brandingowe', 'Doradzałem menedżerom w sprawach prawa pracy', 'Skróciłem średni czas rekrutacji z 45 do 28 dni'],
    healthcare: ['Sprawowałem kompleksową opiekę nad pacjentami na oddziale', 'Podawałem leki i wykonywałem zabiegi zgodnie ze zleceniami lekarza', 'Prowadziłem dokumentację medyczną pacjentów', 'Monitorowałem parametry życiowe i reagowałem na zmiany stanu zdrowia', 'Edukowałem pacjentów i rodziny w zakresie profilaktyki i leczenia', 'Współpracowałem z zespołem interdyscyplinarnym', 'Dbałem o przestrzeganie procedur higieny i bezpieczeństwa', 'Wprowadzałem nowych pracowników w procedury oddziału'],
    general: ['Realizowałem powierzone zadania terminowo i zgodnie ze standardami firmy', 'Współpracowałem z zespołem przy realizacji wspólnych celów', 'Usprawniłem proces, oszczędzając zespołowi kilka godzin tygodniowo', 'Szkoliłem i wspierałem nowych pracowników', 'Przygotowywałem raporty i analizy dla przełożonych', 'Kontaktowałem się z klientami i partnerami biznesowymi', 'Dbałem o jakość i dokładność wykonywanej pracy', 'Proponowałem i wdrażałem usprawnienia w codziennej pracy'],
  },
  skills: {
    marketing: ['Google Ads', 'Meta Ads', 'Google Analytics 4', 'SEO', 'Copywriting', 'Social media', 'E-mail marketing', 'Canva', 'WordPress', 'Content marketing'],
    sales: ['Negocjacje', 'Pozyskiwanie klientów', 'CRM (Salesforce, HubSpot)', 'Prezentacje', 'Obsługa kluczowych klientów', 'Prowadzenie lejka sprzedaży', 'Cold calling', 'Prawo jazdy kat. B'],
    it: ['Java', 'Spring Boot', 'TypeScript', 'Angular', 'SQL', 'Git', 'Docker', 'REST API', 'AWS', 'Testy jednostkowe'],
    customer: ['Obsługa klienta', 'Obsługa kasy fiskalnej', 'Komunikatywność', 'Rozwiązywanie reklamacji', 'Praca pod presją czasu', 'Sprzedaż dodatkowa', 'Obsługa terminala płatniczego', 'Język angielski'],
    admin: ['MS Office', 'Excel', 'Obieg dokumentów', 'Organizacja pracy', 'Korespondencja biznesowa', 'Organizacja wydarzeń', 'Obsługa urządzeń biurowych', 'RODO'],
    finance: ['Księgowość', 'Symfonia', 'Comarch Optima', 'Excel zaawansowany', 'Podatki VAT/CIT/PIT', 'Sprawozdawczość finansowa', 'Płace i ZUS', 'Analiza finansowa'],
    logistics: ['Obsługa wózka widłowego (UDT)', 'WMS', 'Skaner magazynowy', 'Kompletacja zamówień', 'Inwentaryzacja', 'Prawo jazdy kat. C', 'BHP', 'Planowanie dostaw'],
    hr: ['Rekrutacja', 'Prawo pracy', 'Onboarding', 'Kadry i płace', 'Employer branding', 'Systemy ATS', 'Rozmowy kompetencyjne', 'Excel'],
    healthcare: ['Opieka nad pacjentem', 'Podawanie leków', 'Dokumentacja medyczna', 'Pierwsza pomoc', 'Pomiar parametrów życiowych', 'Empatia', 'Praca zmianowa', 'Procedury sanitarne'],
    general: ['Komunikatywność', 'Praca zespołowa', 'Organizacja czasu', 'Rozwiązywanie problemów', 'MS Office', 'Język angielski', 'Samodzielność', 'Prawo jazdy kat. B'],
  },
  summaries: {
    marketing: ['Specjalista ds. marketingu z doświadczeniem w kampaniach performance i content marketingu. Łączę kreatywność z analizą danych – planuję, mierzę i optymalizuję działania, by realnie zwiększać sprzedaż. Szukam roli, w której rozwinę strategię marketingową marki.'],
    sales: ['Handlowiec nastawiony na wyniki, z doświadczeniem w sprzedaży B2B i budowaniu długofalowych relacji z klientami. Regularnie przekraczam plany sprzedażowe dzięki skutecznym negocjacjom i dobremu zrozumieniu potrzeb klienta.'],
    it: ['Programista z doświadczeniem w tworzeniu aplikacji webowych w Javie i Angularze. Dbam o jakość kodu, testy i wydajność, a w pracy zespołowej cenię komunikację i dzielenie się wiedzą. Szukam projektu, w którym będę rozwijać się technicznie.'],
    customer: ['Komunikatywna i uśmiechnięta osoba z doświadczeniem w obsłudze klienta i sprzedaży. Sprawnie rozwiązuję problemy, dobrze pracuję pod presją czasu i dbam o to, by każdy klient wychodził zadowolony.'],
    admin: ['Dobrze zorganizowany pracownik administracyjny z doświadczeniem w prowadzeniu biura i obiegu dokumentów. Sprawnie koordynuję wiele zadań jednocześnie, biegle obsługuję MS Office i dbam o porządek w procesach.'],
    finance: ['Księgowy z doświadczeniem w prowadzeniu pełnej księgowości i przygotowywaniu deklaracji podatkowych. Cechuje mnie dokładność, znajomość przepisów i umiejętność automatyzacji raportów.'],
    logistics: ['Doświadczony pracownik magazynu z uprawnieniami UDT, przyzwyczajony do pracy w szybkim tempie i dbałości o bezpieczeństwo. Sprawnie kompletuję zamówienia i obsługuję systemy WMS.'],
    hr: ['Specjalista HR z doświadczeniem w rekrutacji i obsłudze kadrowej. Skutecznie łączę potrzeby biznesu z oczekiwaniami kandydatów i dbam o pozytywne doświadczenia pracowników od pierwszego dnia.'],
    healthcare: ['Pielęgniarka z doświadczeniem w opiece nad pacjentami na oddziale szpitalnym. Działam spokojnie w sytuacjach stresowych, dbam o bezpieczeństwo pacjentów i dobrą współpracę w zespole medycznym.'],
    general: ['Zaangażowany i odpowiedzialny pracownik, który szybko się uczy i dobrze odnajduje w zespole. Cenię rzetelność, dobrą organizację pracy i chętnie podejmuję nowe wyzwania.'],
  },
};

const EN: Bank = {
  titles: ['Marketing Specialist', 'Sales Representative', 'Account Manager', 'Sales Manager', 'Java Developer', 'Frontend Developer', 'QA Tester', 'Data Analyst', 'Customer Service Representative', 'Cashier', 'Retail Sales Associate', 'Receptionist', 'Office Assistant', 'Administrative Specialist', 'Accountant', 'Payroll Specialist', 'Warehouse Worker', 'Truck Driver', 'Logistics Coordinator', 'Recruiter', 'HR Specialist', 'Registered Nurse', 'Care Assistant', 'Project Manager', 'Graphic Designer', 'Waiter', 'Barista'],
  bullets: {
    marketing: ['Planned and ran Google Ads and Meta Ads campaigns, increasing leads by 35%', 'Created blog and social media content, doubling organic reach within a year', 'Analysed performance in Google Analytics 4 and prepared monthly reports', 'Optimised the website for SEO, improving rankings for 40 key phrases', 'Coordinated work with agencies and influencers', 'Built e-mail campaigns with open rates above 30%', 'Ran landing page A/B tests, increasing conversion by 18%', 'Managed the monthly marketing budget and tracked ROI'],
    sales: ['Achieved 120% of the annual sales target', 'Won 40 new business clients within a year', 'Negotiated and closed contracts worth up to £100k', 'Built long-term relationships with key accounts', 'Prepared tailored offers and product presentations', 'Managed the sales pipeline in CRM and reported forecasts', 'Grew sales in a new region from scratch', 'Trained new sales staff in selling techniques'],
    it: ['Designed and built REST APIs in Java and Spring Boot', 'Developed responsive interfaces in Angular and TypeScript', 'Cut application response time by 40% by optimising SQL queries', 'Wrote unit and integration tests, keeping coverage above 80%', 'Deployed applications to AWS using Docker and CI/CD', 'Performed code reviews and shared knowledge across the team', 'Worked with the Product Owner in Scrum', 'Automated processes, saving the team 10 hours per week'],
    customer: ['Served around 80 customers a day with a 4.8/5 satisfaction score', 'Resolved complaints and requests by phone and e-mail', 'Operated the till and card terminal, balancing shifts without discrepancies', 'Advised customers on products, increasing add-on sales', 'Kept product displays and the shop floor tidy', 'Received and issued goods and checked stock levels', 'Introduced new staff to service standards', 'Logged cases in the CRM system'],
    admin: ['Coordinated office operations and management calendars', 'Handled document flow and company correspondence', 'Organised meetings, business travel and company events', 'Prepared reports and summaries in Excel', 'Ordered office supplies and worked with vendors', 'Introduced electronic invoice approval, halving approval time', 'Ran reception and the switchboard', 'Archived documents in line with procedures and GDPR'],
    finance: ['Kept full accounts for 15 entities', 'Prepared VAT and tax returns', 'Produced monthly and annual financial statements', 'Reconciled balances with suppliers, customers and banks', 'Processed payroll for 120 employees', 'Supported auditors during the annual audit', 'Prepared budgets and variance analyses', 'Automated Excel reports, shortening month-end close by 3 days'],
    logistics: ['Received, picked and dispatched goods using a WMS', 'Operated a forklift and handheld scanner', 'Picked around 300 orders a day without errors', 'Carried out stocktakes and inventory checks', 'Planned delivery routes and schedules', 'Coordinated with carriers and forwarders', 'Followed health and safety rules in the warehouse', 'Reorganised storage, cutting picking time by 15%'],
    hr: ['Ran end-to-end recruitment from job ad to hire', 'Hired more than 60 people in a year', 'Maintained personnel files and working-time records', 'Organised onboarding and training for new employees', 'Helped shape the pay policy and performance reviews', 'Ran employer branding activities', 'Advised managers on employment law', 'Reduced average time-to-hire from 45 to 28 days'],
    healthcare: ['Provided comprehensive care for patients on the ward', 'Administered medication and treatments as prescribed', 'Kept accurate patient records', 'Monitored vital signs and responded to changes in condition', 'Educated patients and families on prevention and treatment', 'Worked within a multidisciplinary team', 'Followed hygiene and safety procedures', 'Inducted new staff into ward procedures'],
    general: ['Completed assigned tasks on time and to company standards', 'Worked with the team to achieve shared goals', 'Improved a process, saving the team several hours a week', 'Trained and supported new colleagues', 'Prepared reports and analyses for managers', 'Liaised with customers and business partners', 'Ensured quality and accuracy of work', 'Suggested and implemented everyday improvements'],
  },
  skills: {
    marketing: ['Google Ads', 'Meta Ads', 'Google Analytics 4', 'SEO', 'Copywriting', 'Social media', 'E-mail marketing', 'Canva', 'WordPress', 'Content marketing'],
    sales: ['Negotiation', 'Lead generation', 'CRM (Salesforce, HubSpot)', 'Presentations', 'Key account management', 'Pipeline management', 'Cold calling', 'Driving licence'],
    it: ['Java', 'Spring Boot', 'TypeScript', 'Angular', 'SQL', 'Git', 'Docker', 'REST APIs', 'AWS', 'Unit testing'],
    customer: ['Customer service', 'Cash handling', 'Communication', 'Complaint handling', 'Working under pressure', 'Upselling', 'POS systems', 'Teamwork'],
    admin: ['MS Office', 'Excel', 'Document management', 'Organisation', 'Business correspondence', 'Event planning', 'Office equipment', 'GDPR'],
    finance: ['Bookkeeping', 'Xero', 'Sage', 'Advanced Excel', 'VAT returns', 'Financial reporting', 'Payroll', 'Financial analysis'],
    logistics: ['Forklift licence', 'WMS', 'Handheld scanner', 'Order picking', 'Stocktaking', 'HGV licence', 'Health & safety', 'Delivery planning'],
    hr: ['Recruitment', 'Employment law', 'Onboarding', 'HR administration', 'Employer branding', 'ATS systems', 'Competency interviews', 'Excel'],
    healthcare: ['Patient care', 'Medication administration', 'Clinical records', 'First aid', 'Vital signs monitoring', 'Empathy', 'Shift work', 'Infection control'],
    general: ['Communication', 'Teamwork', 'Time management', 'Problem solving', 'MS Office', 'Adaptability', 'Reliability', 'Driving licence'],
  },
  summaries: {
    marketing: ['Marketing specialist experienced in performance and content marketing. Combines creativity with data – plans, measures and optimises campaigns to grow sales. Looking for a role to develop the brand’s marketing strategy.'],
    sales: ['Results-driven salesperson with B2B experience and a track record of building long-term client relationships. Consistently exceeds targets through effective negotiation and a clear understanding of customer needs.'],
    it: ['Developer experienced in building web applications with Java and Angular. Cares about code quality, testing and performance, and values communication and knowledge sharing in the team.'],
    customer: ['Friendly, communicative person with experience in customer service and retail. Solves problems quickly, works well under pressure and makes sure every customer leaves satisfied.'],
    admin: ['Well-organised administrative professional experienced in running an office and managing document flow. Handles many tasks at once, is fluent in MS Office and keeps processes in order.'],
    finance: ['Accountant experienced in full bookkeeping and tax returns. Accurate, up to date with regulations and skilled at automating reports.'],
    logistics: ['Experienced warehouse operative with a forklift licence, used to a fast pace and committed to safety. Picks orders efficiently and works confidently with WMS systems.'],
    hr: ['HR specialist experienced in recruitment and HR administration. Balances business needs with candidate expectations and ensures a positive employee experience from day one.'],
    healthcare: ['Registered nurse experienced in ward-based patient care. Stays calm under pressure, puts patient safety first and works well within the medical team.'],
    general: ['Committed and reliable worker who learns fast and fits in well with a team. Values diligence and good organisation and welcomes new challenges.'],
  },
};

export function phraseBank(lang: string): Bank {
  return lang === 'pl' ? PL : EN;
}
