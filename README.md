# web-pohja

Dimman verkkosivustopohja, jolla Dimma tuottaa sivustot asiakkailleen. Samaa pohjaa käytetään myös Boostaamo-konsernin yhtiöiden sivustoihin (`web-<yhtiö>`); konsernin sivustokokonaisuutta hallitaan repossa `boostaamo-web`. Next.js (App Router, TypeScript), sisältö Markdown-tiedostoina, lomake ja liidit, analytiikka suostumuksella ja julkaisu Vercelin kautta GitHubista.

## Uusi sivusto tästä pohjasta
1. GitHubissa: avaa tämä repo ja valitse "Use this template" (tai kopioi kansio). Nimeä uusi repo `web-<asiakas>`, yksityinen, Boostaamo-organisaatioon.
2. Kloonaa uusi repo koneelle: `git clone https://github.com/Boostaamo/web-<asiakas>.git`
3. Asenna riippuvuudet: `npm install`
4. Kopioi `.env.example` tiedostoksi `.env.local` ja täytä arvot.
5. Käynnistä: `npm run dev` ja avaa http://localhost:3000
6. Tarkista, että tuotantokäännös onnistuu: `npm run build`

## Rakenne
- `content/pages/*.md`: sivut (frontmatter: title, description, form, noindex, updated)
- `content/site.json`: sivuston nimi, navigaatio, footer, Boostaamo-ekosysteemi (yhtiösivustoilla ekosysteemilinkit kopioidaan `boostaamo-web/ekosysteemi/ekosysteemi.json`:sta)
- `app/globals.css`: värit ja tyylit CSS-muuttujina (vaihda design systemin arvot)
- `app/api/lead/route.ts`: lomakkeen vastaanotto ja lähetys liidirekisteriin
- `components/`: Header, Footer, LeadForm, Analytics (suostumus)
- `CHECKLIST.md`: laadunvarmistus ennen julkaisua

## Sisällön muokkaus (Dimma)
- Muokkaa tai lisää Markdown-tiedostoja kansiossa `content/pages`. Tiedoston nimi on osoite: `palvelut.md` näkyy osoitteessa `/palvelut`. Alikansio toimii polkuna: `blogi/artikkeli.md` on `/blogi/artikkeli`.
- Lisää uusi sivu navigaatioon tiedostossa `content/site.json`.
- Lomake sivulle: lisää frontmatteriin `form: lead`.

## Liidit ja liidirekisteri
Lomake lähettää liidin JSON-viestinä osoitteeseen `LEAD_WEBHOOK_URL`. Liidirekisteri on järjestelmä, joka ottaa viestin vastaan (CRM, Odoo, automaatiotyökalu tai taulukko). Viestin kentät: name, email, company, message, consent, source, page, referrer, utm (source, medium, campaign, term, content), receivedAt. Jos kohdejärjestelmä tarvitsee eri muodon, muuta sovitin tiedostossa `app/api/lead/route.ts`. Tästä pidemmälle menevä integraatio kuuluu Bistekille.

Tietosuoja: kirjaa tietosuojaselosteeseen, mihin liidit tallentuvat, kuinka kauan niitä säilytetään ja kuka on rekisterinpitäjä.

## Analytiikka
GA4-tunnus asetetaan `NEXT_PUBLIC_GA_ID`-muuttujaan. Skripti latautuu vain, kun kävijä hyväksyy analytiikan. Lomakkeen onnistunut lähetys lähettää `generate_lead`-tapahtuman. Lisää omia tapahtumia `track()`-funktiolla (`lib/analytics.ts`).

## Julkaisu: GitHub, Vercel
1. Vercelissä: Add New, Project, valitse GitHub-repo `web-<asiakas>`. Framework Next.js tunnistetaan automaattisesti.
2. Aseta ympäristömuuttujat (`NEXT_PUBLIC_SITE_URL`, `LEAD_WEBHOOK_URL`, `LEAD_WEBHOOK_SECRET`, `NEXT_PUBLIC_GA_ID`) asetuksissa: Settings, Environment Variables. Erota Production ja Preview.
3. Jokaisesta haarasta ja pull requestista syntyy esikatselulinkki (Preview). Asiakas hyväksyy sen.
4. Kun haara yhdistetään `main`-haaraan, Vercel julkaisee tuotantoon.
5. Domain: lisää verkkotunnus kohdassa Settings, Domains, ja päivitä DNS Vercelin ohjeiden mukaan. Kirjaa, kuka omistaa tunnuksen.
6. Julkaisun jälkeen: tarkista sivusto tuotannossa, testaa lomake, varmista analytiikka ja lähetä sivusto hakukoneiden Search Console -palveluun.

## Työnkulku
```
git checkout -b feature/etusivu
# tee muutokset
npm run build
git add -A && git commit -m "Päivitä etusivu"
git push -u origin feature/etusivu
```
Avaa pull request GitHubissa. Esikatselulinkki ilmestyy PR:ään. Hyväksynnän jälkeen yhdistä `main`-haaraan.

## Rajat
Pohja kattaa tavallisen yrityssivuston: sisältösivut, lomakkeet, liidirekisteri ja analytiikka. Kirjautuminen, maksut, räätälöidyt taustajärjestelmät ja laajat integraatiot siirretään Bistekille.
