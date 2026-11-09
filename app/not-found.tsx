import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container">
      <h1>Sivua ei löytynyt</h1>
      <p>Hakemaasi sivua ei ole olemassa tai se on siirretty.</p>
      <p><Link href="/">Palaa etusivulle</Link></p>
    </div>
  );
}
