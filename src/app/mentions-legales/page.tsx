import React from "react";

export default function LegalNotice() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">
        Mentions Légales
        <br />
        <span className="text-base font-normal">Dernière mise à jour : 16 Octobre 2025</span>
      </h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Informations sur l'éditeur</h2>
          <p className="mb-2">
            <strong>Nom de l'entreprise :</strong> Bamby Joy<br />
            <strong>Adresse :</strong> Sakiet Ezzit, Sfax 3021, Tunisia<br />
            <strong>Email :</strong> <a href="mailto:hamdensmaoui25@gmail.com" className="text-blue-600">hamdensmaoui25@gmail.com</a><br />
            <strong>Téléphone :</strong> <a href="tel:23886942" className="text-blue-600">23 886 942</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Directeur de la publication</h2>
          <p>
            <strong>Nom :</strong> [Votre Nom Complet]<br />
            <strong>Email :</strong> <a href="mailto:hamdensmaoui25@gmail.com" className="text-blue-600">hamdensmaoui25@gmail.com</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Hébergement du site</h2>
          <p>
            <strong>Hébergeur :</strong> Vercel Inc.<br />
            <strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA<br />
            <strong>Site web :</strong> <a href="https://vercel.com" className="text-blue-600" target="_blank" rel="noopener noreferrer">https://vercel.com</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Propriété intellectuelle</h2>
          <p>
            L'ensemble du contenu de ce site (textes, images, vidéos, logos) est la propriété exclusive de Bamby Joy, 
            sauf mention contraire. Toute reproduction, distribution ou utilisation sans autorisation préalable est interdite 
            et peut donner lieu à des poursuites judiciaires.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Données personnelles</h2>
          <p>
            Pour plus d'informations sur la collecte et le traitement de vos données personnelles, 
            veuillez consulter notre <a href="/privacy-policy" className="text-blue-600 underline">Politique de Confidentialité</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Cookies</h2>
          <p>
            Ce site utilise des cookies. Pour en savoir plus, consultez notre{" "}
            <a href="/cookie-policy" className="text-blue-600 underline">Politique des Cookies</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Limitation de responsabilité</h2>
          <p>
            Bamby Joy s'efforce de fournir des informations aussi précises que possible. Toutefois, 
            nous ne pouvons garantir l'exactitude, la complétude ou l'actualité des informations présentes sur ce site. 
            Nous déclinons toute responsabilité en cas d'erreur ou d'omission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Droit applicable</h2>
          <p>
            Les présentes mentions légales sont régies par le droit tunisien. 
            Tout litige sera soumis aux tribunaux compétents de Sfax, Tunisie.
          </p>
        </section>
      </div>
    </div>
  );
}