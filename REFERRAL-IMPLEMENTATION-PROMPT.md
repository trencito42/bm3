# Prompt pentru Claude — sistemul de referral Blipmade

Implementează complet sistemul de referral în aplicația Blipmade, folosind paginile BM3 ca referință de UI. Vreau implementare reală, de la linkul de invitație la atribuirea clientului, calculul comisioanelor și decontare. Lucrează în stack-ul existent, cu autentificarea, comenzile, facturile și procesatorii existenți. Analizează întâi repository-ul și instrucțiunile lui, apoi implementează și testează. Păstrează designul BM3.

## Referințele de UI deja implementate

- `src/site/ReferralPage.jsx`: pagina de promovare a programului, calculatorul 15% / 20%, preview de link și mesaj de promovare.
- `src/site/InvitationPage.jsx`: landing pentru persoana invitată. Prezintă întregul Blipmade: web hosting, aplicații, VPS, jocuri, baze de date, email și domenii.
- `src/site/referrals.js`, `src/main.jsx`, `src/site/SiteApp.jsx`: demonstrația de rutare și păstrare a parametrului `ref` în URL până la înregistrare.
- `src/components/MorphAction.jsx`: butonul care se extinde într-un dialog, în stilul pre-register.
- `src/site/ReferralArtwork.jsx`, `src/site/referral.css`, `src/site/invitation.css`: efectele și layout-ul.
- `src/studio/Billing.jsx`, `src/studio/AdminCommerce.jsx`, `src/studio/AdminStudio.jsx`: referințe pentru billing și admin.

BM3 este în prezent un design workspace cu mock data. Linkurile generate aici sunt preview-uri; nu există încă tracking financiar real. Păstrează paginile și înlocuiește simulările cu integrarea backend-ului real. Dacă repository-ul curent conține numai UI-ul, identifică precis ce repo/API backend lipsește; nu declara sistemul funcțional folosind localStorage sau rezultate simulate. Nu construi un al doilea sistem de autentificare sau billing.

## 1. Două niveluri de comision

- **Referral: 15%.** Nivelul standard al unui cont afiliat activ.
- **Partner: 20%.** Acordat explicit de un administrator autorizat. Fără upgrade din client și fără praguri de volum inventate.
- O comandă are un singur afiliat beneficiar. Un procent de 20% înlocuiește procentul de 15%; procentele nu se cumulează.
- Salvează pe fiecare comision procentul și baza de calcul aplicate la confirmarea plății. Modificarea nivelului nu recalculează retroactiv comisioanele existente.
- Programul deservește întreaga ofertă Blipmade. Folosește regulile de eligibilitate existente pentru produse; nu îl limita la jocuri.

## 2. Regula obligatorie: creditul nu produce comision

Decizia se ia exclusiv pe server, din alocările reale ale plăților, registrul de wallet/credit și evenimentele confirmate ale procesatorului. Niciun parametru trimis de client nu poate declara o comandă eligibilă.

**O comandă care folosește orice sumă de credit de cont / wallet produce ZERO comision, inclusiv când plata este mixtă.**

Exemple de acceptanță:

| Comandă | Plata efectivă | Comision 15% | Comision 20% |
| --- | --- | --- | --- |
| $100 eligibili | $100 card, capturați și confirmați | $15 | $20 |
| $100 eligibili | $100 credit de cont | $0 | $0 |
| $100 eligibili | $99 card + $1 credit de cont | $0 | $0 |
| $100 eligibili | $100 wallet alimentat anterior cu bani reali | $0 | $0 |
| Alimentare wallet de $100 | $100 card | $0 | $0 |
| $100 eligibili | Card doar autorizat, neîncasat | $0 până la încasarea completă |

„Credit” înseamnă soldul intern, credit promoțional, credit rezultat din refund, sold de referral convertit în credit și orice sursă echivalentă din ledger. Un card bancar de credit achitat prin procesator este tot o plată externă în bani reali, dacă suma a fost efectiv încasată.

- Exclude alimentările de wallet, cumpărarea de credit, gift cards/vouchere monetare și transferurile interne. Nu plăti comision de două ori pentru aceeași valoare.
- O reducere comercială obișnuită scade baza de calcul; nu o confunda cu plata din wallet. Dacă un voucher reprezintă sold stocat, aplică regula creditului.
- Pentru comenzile integral plătite extern: baza eligibilă este valoarea produselor eligibile după reduceri, fără TVA/taxe și fără taxe de plată separate. Folosește defalcarea existentă a facturii, nu totalul brut din browser.
- Comenzile parțial plătite, neplătite, anulate, eșuate sau finanțate cu surse necunoscute nu devin eligibile.
- Aplică aceleași reguli comenzilor ulterioare și reînnoirilor eligibile atribuite clientului. Nu promite public „lifetime commissions” sau o durată pe care politica produsului nu o definește.

## 3. Atribuire reală și landing

- `https://blipmade.com/?ref=trencito` trebuie să deschidă landing-ul general al invitației și să rezolve handle-ul la un afiliat real, activ, în backend.
- Afișează numele public/handle-ul afiliatului, fără date private. Menține disclosure-ul că autorul recomandării poate primi comision.
- Un handle invalid, inexistent sau suspendat deschide o variantă neutră și nu atribuie comisioane. Un query string valid sintactic nu dovedește existența unui afiliat.
- Păstrează atribuirea prin navigație, înregistrare și checkout în mecanismul server-side existent. Protejează identificatorul/tokenul împotriva modificării din client; respectă mecanismul de consimțământ al proiectului pentru orice cookie/tracking introdus.
- Atribuie clientul afiliatului printr-o operație verificată pe server. O vizită ulterioară sau o editare a URL-ului nu trebuie să poată muta arbitrar un client deja atribuit.
- Folosește politica existentă de atribuire și fereastră de valabilitate. Dacă lipsesc, fă aceste politici explicite și configurabile și documentează valorile inițiale; nu ascunde presupuneri în cod sau în copy.
- Închide preview-ul la navigarea spre landing, fără dialoguri rămase peste pagină. Păstrează animațiile, focus management, Escape și responsive layout.

## 4. Model de date și registru financiar

Adaptează schema existentă cu migrări reale, constrângeri și indexuri. Sunt necesare echivalente pentru:

- Cont afiliat: user, handle unic normalizat, nivel, status, procent și istoric de schimbări.
- Atribuire: client, afiliat, sursă și dată; reguli clare pentru expirare și conflicte.
- Comision: order/invoice/payment identifiers, bază eligibilă, procent snapshot, sumă, monedă, stare și motivul excluderii/anulării.
- Ledger append-only de accrual, reversal, adjustment, reservation și payout. Sumele disponibile trebuie să poată fi reconciliate cu acest registru.
- Cerere de payout și referința operațiunii externe, dacă proiectul suportă retrageri în bani.
- Audit: schimbări de nivel, suspendări, ajustări, aprobări și decontări, cu actor și timestamp.

Folosește integer minor units sau decimal financiar, fără floating point pentru bani. Nu însuma monede diferite ca și cum ar fi aceeași monedă. Rotunjirea trebuie definită și consecventă.

## 5. Plăți, webhook-uri, refunduri și payout

- Creează comisionul numai după confirmarea încasării complete din surse externe eligibile. Verifică semnătura webhook-urilor și starea reală a plății, nu pagina de succes din browser.
- Procesează evenimentele idempotent, în tranzacții. Webhook-uri duplicate, întârziate sau primite în altă ordine nu trebuie să dubleze comisioane, reversări sau payout-uri.
- Impune unicitate pentru evenimentul financiar care produce comisionul și corelează plățile multiple ale aceleiași facturi.
- Stări explicite: pending, available, reserved/requested, paid, reversed/void, conform arhitecturii existente. Un hold configurabil previne decontarea imediată înainte de verificări/refunduri.
- Refund integral: anulează/reversează integral comisionul. Refund parțial pe produse eligibile: recalculează/reversează proporțional baza netă aferentă. Refundul exclusiv de TVA nu inversează un comision calculat deja fără TVA.
- Chargeback/dispută: blochează sau reversează comisionul conform politicii. Dacă era deja plătit, creează o ajustare/debit auditat și recuperează din solduri viitoare; nu șterge istoricul.
- Nu dubla reversarea când un chargeback este urmat de un refund. Reconcilează cu suma netă eligibilă rămasă.
- Nici afiliatul, nici un endpoint din browser nu pot marca un payout drept plătit. Confirmarea trebuie să provină din fluxul financiar real sau din operațiunea administrativă verificată existentă.
- Verifică soldul disponibil și rezervă atomic suma la cererea de retragere. Două request-uri concurente nu pot retrage aceiași bani. Un payout eșuat eliberează rezervarea o singură dată.
- Folosește pragurile, metodele și politica de payout ale proiectului. Dacă nu există, implementează configurarea și fluxul administrativ și documentează deciziile; nu inventa promisiuni publice despre praguri sau frecvența plăților.

## 6. Client area și admin

În contul utilizatorului, implementează: activarea programului, nivel/procent, link personal valid, mesaje de share, referral-uri, comisioane pending/disponibile/plătite/reversate, istoricul comenzilor și motivul excluderilor. Formularele și butoanele trebuie să execute operațiuni reale și să aibă loading, empty, error și success states. Nu expune datele private ale clienților invitați.

În admin: listă și detaliu afiliat, atribuire de nivel Partner, suspendare/reactivare, configurația programului, comisioane cu proveniența plății, ajustări cu motiv obligatoriu, payout review și reconciliere. Protejează operațiunile prin permisiunile existente și audit. Suspendarea trebuie să aibă un efect clar asupra noilor comisioane și să păstreze istoricul.

## 7. Protecții și verificări obligatorii

- Fără auto-referral: același user/client nu poate fi propriul beneficiar. Folosește și semnalele antifraudă existente; un IP comun, singur, nu dovedește frauda.
- Nu permite manipularea nivelului, procentului, bazei, soldului, monedei, payment status sau payout status prin payload-uri de client.
- Verifică ownership-ul pentru fiecare endpoint; un afiliat nu poate vedea sau modifica datele altuia. Rate limiting și protecțiile CSRF/session ale proiectului rămân active.
- Teste automate pentru ambele procente, bani reali, credit integral, orice amestec credit + bani, top-up, reduceri, TVA, plăți incomplete și rotunjiri.
- Teste pentru webhook duplicat/out-of-order, două procesări concurente, schimbarea nivelului, refund integral/parțial, chargeback înainte/după payout și retrageri concurente.
- Teste de flow: share link → landing general personalizat → produs din mai multe categorii → signup → plată externă confirmată → comision corect în client area/admin.
- Același flow plătit cu credit trebuie să producă zero comision și un motiv explicit în admin.
- Verifică desktop/mobil, copy link, navigarea din dialog, validarea handle-ului, referrer necunoscut, cont suspendat, auto-referral, acces neautorizat și feature flags.
- Testează procesatorii în sandbox. Nu executa plăți, payout-uri sau modificări financiare de producție în timpul verificărilor.

## Livrare

Livrează codul și migrările, integrarea completă a UI-ului, testele relevante, documentația setărilor/politicilor și pașii de deploy/rollback. Raportează concret ce ai testat și orice dependență externă rămasă. Nu declara „funcționează perfect” fără dovezi și nu masca un backend lipsă cu mock-uri. Nu schimba designul BM3 și nu face modificări fără legătură cu referral-ul.
