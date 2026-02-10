export default function Aide() {
  return (
    <div className="page-container">
      <div className="help-container">
        <h1>Aide et Support</h1>
        <p className="subtitle">Trouvez des réponses à vos questions</p>

        <div className="faq-section">
          <h2>Questions Fréquemment Posées (FAQ)</h2>

          <div className="faq-item">
            <h3>📚 Qu&apos;est-ce que cette plateforme ?</h3>
            <p>
              Cette plateforme est un système de gestion de formations permettant aux
              étudiants de s&apos;inscrire à des formations, aux formateurs de gérer leurs sessions,
              et aux administrateurs de gérer l&apos;ensemble du système.
            </p>
          </div>

          <div className="faq-item">
            <h3>👤 Comment créer un compte ?</h3>
            <p>
              Cliquez sur le lien &quot;S&apos;inscrire&quot; sur la page de connexion et remplissez le
              formulaire avec vos informations. Vous devez spécifier votre rôle (étudiant,
              formateur ou admin).
            </p>
          </div>

          <div className="faq-item">
            <h3>🔐 Comment se connecter ?</h3>
            <p>
              Allez à la page de connexion, entrez votre email et votre mot de passe, puis cliquez
              sur &quot;Se connecter&quot;. Vous serez redirigé vers votre tableau de bord.
            </p>
          </div>

          <div className="faq-item">
            <h3>📝 Comment m&apos;inscrire à une formation ? (Étudiant)</h3>
            <p>
              Allez à la section &quot;Explorer les formations&quot;, sélectionnez la formation qui vous
              intéresse et cliquez sur &quot;S&apos;inscrire&quot;. Votre inscription sera visible dans
              &quot;Mes inscriptions&quot;.
            </p>
          </div>

          <div className="faq-item">
            <h3>📅 Comment ajouter une session ? (Formateur/Admin)</h3>
            <p>
              Accédez à la section &quot;Gérer sessions&quot; et cliquez sur &quot;Ajouter Session&quot;.
              Remplissez les détails de la session (date, formation, etc.) et validez.
            </p>
          </div>

          <div className="faq-item">
            <h3>🎓 Comment obtenir un certificat ?</h3>
            <p>
              Après avoir validé une session avec au moins 17 inscriptions, les certificats sont
              générés automatiquement. Vous pouvez les télécharger depuis la section
              &quot;Mes certificats&quot;.
            </p>
          </div>

          <div className="faq-item">
            <h3>✓ Quand une session est validée ?</h3>
            <p>
              Une session est validée lorsqu&apos;elle a au moins 17 inscriptions confirmées. Le
              formateur ou l&apos;administrateur peut valider la session manuellement.
            </p>
          </div>

          <div className="faq-item">
            <h3>🔄 Comment modifier mes informations ?</h3>
            <p>
              Allez à la section &quot;Mon Profil&quot; pour voir et modifier vos informations personnelles.
              Vous pouvez également changer votre mot de passe depuis cette page.
            </p>
          </div>
        </div>

        <div className="support-section">
          <h2>Support et Contact</h2>
          <div className="contact-info">
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:support@cni-formations.fr">support@cni-formations.fr</a>
            </p>
            <p>
              <strong>Téléphone:</strong> <a href="tel:+33123456789">+33 1 23 45 67 89</a>
            </p>
            <p>
              <strong>Horaires:</strong> Lundi à vendredi, 9h00 - 17h00
            </p>
          </div>
        </div>

        <div className="roles-section">
          <h2>Rôles et Permissions</h2>

          <div className="role-card">
            <h3>👤 Étudiant</h3>
            <ul>
              <li>Explorer et consulter toutes les formations</li>
              <li>S&apos;inscrire à des sessions</li>
              <li>Voir l&apos;état de ses inscriptions</li>
              <li>Télécharger ses certificats</li>
              <li>Gérer son profil</li>
            </ul>
          </div>

          <div className="role-card">
            <h3>👨‍🏫 Formateur</h3>
            <ul>
              <li>Créer et gérer ses sessions</li>
              <li>Voir les inscriptions de ses sessions</li>
              <li>Valider/annuler les inscriptions</li>
              <li>Générer et télécharger les certificats</li>
              <li>Gérer son profil</li>
            </ul>
          </div>

          <div className="role-card">
            <h3>👨‍💼 Admin</h3>
            <ul>
              <li>Gérer tous les utilisateurs</li>
              <li>Créer et modifier les formations</li>
              <li>Gérer toutes les sessions</li>
              <li>Gérer toutes les inscriptions</li>
              <li>Gérer tous les certificats</li>
              <li>Accéder aux statistiques globales</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .page-container {
          background-color: #f5f5f5;
          padding: 20px;
        }
        .help-container {
          max-width: 900px;
          margin: 0 auto;
        }
        h1 {
          color: #333;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #666;
          font-size: 16px;
          margin-bottom: 30px;
        }
        h2 {
          color: #333;
          margin-top: 30px;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #007bff;
        }
        .faq-section,
        .support-section,
        .roles-section {
          margin-bottom: 30px;
        }
        .faq-item {
          background: white;
          padding: 20px;
          margin-bottom: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .faq-item h3 {
          color: #007bff;
          margin: 0 0 10px 0;
          font-size: 16px;
        }
        .faq-item p {
          margin: 0;
          color: #666;
          line-height: 1.6;
        }
        .contact-info {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .contact-info p {
          margin: 10px 0;
          color: #333;
        }
        .contact-info a {
          color: #007bff;
          text-decoration: none;
        }
        .contact-info a:hover {
          text-decoration: underline;
        }
        .roles-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        .role-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .role-card h3 {
          color: #333;
          margin: 0 0 15px 0;
        }
        .role-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .role-card li {
          padding: 8px 0;
          color: #666;
          border-bottom: 1px solid #f0f0f0;
        }
        .role-card li:before {
          content: "✓ ";
          color: #28a745;
          font-weight: bold;
          margin-right: 8px;
        }
      `}</style>
    </div>
  );
}
