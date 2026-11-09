# Laadunvarmistus ennen julkaisua

Käy lista läpi esikatselulinkillä (Vercel preview). Merkitse jokainen kohta tehdyksi tai perustele poikkeus.

## Sisältö
- [ ] Kaikki `<täydennä>`-kohdat täytetty tai poistettu (`grep -rn "<täydennä>" content`)
- [ ] Ei keksittyjä caseja, lukuja tai referenssejä; väitteillä lähde
- [ ] Jokaisella sivulla title ja description (title alle 60 merkkiä, description 140–160)
- [ ] Yksi H1 per sivu, otsikkotasot loogisia
- [ ] Oikeinkirjoitus tarkistettu, sävy tyyliohjeen mukainen
- [ ] Tietosuojaseloste täytetty ja tarkistettu
- [ ] "A Boostaamo Company" -merkintä ja ekosysteemilinkit tarkistettu (Hub & Spoke)

## Toiminnallisuus
- [ ] Lomake: onnistunut lähetys, virhetilanne, pakolliset kentät, suostumus
- [ ] Liidi saapuu liidirekisteriin (testilähetys) oikeilla kentillä ja UTM-tiedoilla
- [ ] Honeypot ei estä oikeaa käyttäjää
- [ ] Kaikki linkit toimivat (sisäiset ja ulkoiset), ei 404-sivuja
- [ ] 404-sivu toimii

## Analytiikka ja suostumus
- [ ] Evästebanneri näkyy ensimmäisellä käynnillä, valinta tallentuu
- [ ] Ennen suostumusta ei lähde seurantapyyntöjä
- [ ] Suostumuksen jälkeen sivunäytöt ja `generate_lead`-tapahtuma näkyvät analytiikassa
- [ ] Evästeasetukset-linkki toimii

## Tekninen
- [ ] `npm run build` ja `npm run typecheck` läpi ilman virheitä
- [ ] Lighthouse (mobiili): Performance, Accessibility, Best Practices ja SEO tavoitteessa (sovittu raja: <täydennä>)
- [ ] Responsiivisuus: puhelin, tabletti, työpöytä
- [ ] Saavutettavuus: näppäimistöllä toimii, fokus näkyy, kontrastit, kuvien alt-tekstit, lomakkeen labelit
- [ ] Kuvat optimoitu (koko ja formaatti)
- [ ] sitemap.xml ja robots.txt oikein (tuotannossa sallittu, esikatselussa estetty)
- [ ] Canonical-osoitteet ja OG-metatiedot oikein

## Julkaisuvalmius
- [ ] Ympäristömuuttujat asetettu tuotantoon (LEAD_WEBHOOK_URL, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_GA_ID)
- [ ] Domain, DNS ja varmenne suunniteltu; vanhat osoitteet uudelleenohjataan
- [ ] Asiakas on hyväksynyt esikatselun kirjallisesti
