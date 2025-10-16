import React from "react";

export default function CookiePolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">
        Politique des Cookies
        <br />
        <span className="text-base font-normal">Dernière mise à jour : 16 Octobre 2025</span>
      </h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">Qu'est-ce qu'un cookie ?</h2>
          <p>
            Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, tablette ou mobile) 
            lorsque vous visitez notre site web. Les cookies nous permettent de reconnaître votre appareil 
            et d'améliorer votre expérience de navigation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Types de cookies que nous utilisons</h2>
          
          <div className="ml-4 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Cookies strictement nécessaires</h3>
              <p>
                Ces cookies sont essentiels au fonctionnement de notre site. Ils vous permettent de naviguer 
                sur le site et d'utiliser ses fonctionnalités, comme accéder à votre compte et gérer votre panier.
              </p>
              <ul className="list-disc ml-6 mt-2">
                <li>Cookies de session</li>
                <li>Cookies d'authentification</li>
                <li>Cookies de panier d'achat</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Cookies de performance</h3>
              <p>
                Ces cookies collectent des informations sur la façon dont les visiteurs utilisent notre site, 
                comme les pages les plus visitées. Ces données nous aident à améliorer le fonctionnement du site.
              </p>
              <ul className="list-disc ml-6 mt-2">
                <li>Google Analytics (si utilisé)</li>
                <li>Cookies de mesure d'audience</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Cookies de fonctionnalité</h3>
              <p>
                Ces cookies permettent au site de mémoriser vos choix (comme votre langue ou région) 
                pour vous offrir une expérience personnalisée.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Gestion des cookies</h2>
          <p className="mb-3">
            Vous pouvez contrôler et/ou supprimer les cookies comme vous le souhaitez. Vous pouvez supprimer 
            tous les cookies déjà présents sur votre ordinateur et configurer la plupart des navigateurs pour 
            qu'ils les bloquent.
          </p>
          
          <h3 className="font-semibold mb-2">Comment gérer les cookies dans votre navigateur :</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li><strong>Google Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies</li>
            <li><strong>Firefox :</strong> Options → Vie privée et sécurité → Cookies</li>
            <li><strong>Safari :</strong> Préférences → Confidentialité → Cookies</li>
            <li><strong>Edge :</strong> Paramètres → Cookies et autorisations du site</li>
          </ul>
          
          <p className="mt-3 text-sm text-gray-600">
            ⚠️ Veuillez noter que si vous bloquez ou supprimez les cookies, certaines fonctionnalités 
            du site peuvent ne pas fonctionner correctement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Durée de conservation</h2>
          <p>
            Les cookies que nous utilisons ont des durées de vie variables :
          </p>
          <ul className="list-disc ml-6 mt-2">
            <li><strong>Cookies de session :</strong> Supprimés automatiquement lorsque vous fermez votre navigateur</li>
            <li><strong>Cookies persistants :</strong> Restent sur votre appareil jusqu'à leur date d'expiration ou jusqu'à ce que vous les supprimiez</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Modifications de cette politique</h2>
          <p>
            Nous pouvons mettre à jour cette Politique des Cookies de temps à autre. Nous vous encourageons 
            à consulter régulièrement cette page pour rester informé de la manière dont nous utilisons les cookies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Contact</h2>
          <p>
            Pour toute question concernant notre utilisation des cookies, veuillez nous contacter :
          </p>
          <p className="mt-2">
            <strong>Email :</strong> <a href="mailto:hamdensmaoui25@gmail.com" className="text-blue-600">hamdensmaoui25@gmail.com</a><br />
            <strong>Téléphone :</strong> <a href="tel:23886942" className="text-blue-600">23 886 942</a>
          </p>
        </section>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        Cette politique a été générée pour assurer la conformité avec les réglementations sur la protection des données.
      </p>
    </div>
  );
}