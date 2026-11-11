# web-pohja: ohjeet Claudelle

Tämä on Dimman verkkosivustopohja (Next.js, App Router, TypeScript), jolla Dimma tuottaa asiakassivustot ja konsernin yhtiöiden sivustot. Projekti etenee Dimman verkkosivuprosessin mukaan (taito `dimma-verkkosivu-prosessi`, repo `dimma`). Sisältö on Markdown-tiedostoina, eikä sisällön muokkaus vaadi koodia.

## Säännöt
- Sisältö muokataan kansiossa `content/` (sivut: `content/pages/*.md`, asetukset: `content/site.json`). Älä kirjoita sisältöä koodiin.
- Tyylit ja värit ovat CSS-muuttujina tiedostossa `app/globals.css`. Vaihda design systemin arvot siellä.
- Älä lisää riippuvuuksia ilman perustetta. Pidä sivusto staattisena, kun mahdollista.
- Älä koskaan commitoi salaisuuksia tai henkilötietoja. Käytä `.env.local` (paikallinen) ja Vercelin ympäristömuuttujia. Vain `.env.example` on repossa.
- Lomakkeen liidit lähtevät reitille `app/api/lead/route.ts` ja sieltä `LEAD_WEBHOOK_URL`-osoitteeseen. Älä tallenna liidejä repoon.
- Analytiikka latautuu vain suostumuksen jälkeen. Älä lisää seurantaskriptejä ilman suostumuksen tarkistusta.
- Aja `npm run build` ennen jokaista pushia. Älä pushaa rikkinäistä koodia.
- Työskentele haarassa (`feature/...`), älä suoraan `main`-haaraan. `main` julkaistaan tuotantoon.
- Esikatselut eivät saa näkyä hakukoneissa (tämä on jo päällä: robots ja noindex).
- Tekstit: asiakassivustolla sävy ja sanasto hyväksytyn briefin mukaan; konsernin yhtiösivustolla yhtiön repon `context/tyyli.md` ja `context/sanasto.md`. Älä keksi asiakascaseja, lukuja tai referenssejä.

## Rajat
- Räätälöity taustajärjestelmä, kirjautuminen, maksut ja integraatiot tavallista lomaketta ja analytiikkaa laajemmin kuuluvat Bistekille. Pysäytä työ ja kerro, jos tarve ylittää nämä.

## Boostaamon sivusto: lisäohjeet

Sivusto: Boostaamo (konsernin oma sivusto) | Domain: <täydennä> | Rekisteri: boostaamo-core/verkkosivut/sivustot.md
Tila: luonnos | Versio: v0.1 | Pvm: 2026-11-11 | Hyväksyjä: Hannu
Kokonaisohje: boostaamo-core/verkkosivut/claude-code-ohje.md (Claude Code -projekti Verkkosivut, tämä sivusto omassa ketjussaan).

### Lähteet
- Linjaukset: boostaamo-core/verkkosivut/linjaukset.md. Ekosysteemilinkit: boostaamo-core/verkkosivut/ekosysteemi/ekosysteemi.json → content/site.json.
- Sisältö: vain hyväksytyt tekstit kansiosta Konserni/04 Markkinointi ja brändi/Verkkosivut/Hyväksytyt. Markkinointipäällikkö tuottaa briefin, sivukartan ja tekstit; jos teksti puuttuu, jätä <täydennä> ja kerro, mitä tarvitaan. Älä kirjoita markkinointiviestejä itse.
- Sävy ja sanasto: boostaamo-core/context/tyyli.md.
- Tuotenimet ja hinnat: palvelumatriisi (Konserni/02 Palvelut ja tuotteet). Hintoja ei julkaista sivustolla ilman Hannun päätöstä.

### Säännöt
- Konversiopiste: Kasvukoneiston katsastus.
- Alalaidassa "A Boostaamo Company" ja ekosysteemilinkit.
- Ei keksittyjä caseja, lukuja, referenssejä, asiakaslogoja tai lupauksia.
- Ei salaisuuksia, .env-tiedostoja, liidejä, henkilötietoja eikä asiakasdataa repoon. Luottamukselliset-kansiota ei käytetä.
- Työ haarassa feature/..., npm run build ennen pushia, pull request ja Vercelin esikatselu. Älä yhdistä main-haaraan: Hannu hyväksyy ja julkaisee.
- Domainiin, DNS:ään ja Vercelin tuotantoasetuksiin ei kosketa ilman Hannun erillistä lupaa.
- Kirjautuminen, maksut, taustajärjestelmät ja laajat integraatiot: pysäytä ja ehdota Bistekiä.
- Julkaisun jälkeen kerro, mitä rekisteriin (sivustot.md) pitää päivittää: repo, Vercel-projekti, julkaisupäivä, domain.
- Repo on julkinen (päätös julkisuudesta auki): tähän repoon ei koskaan sisäisiä tietoja, kuten DNS-omistajia, vastuuhenkilöitä tai hinnoittelua.
