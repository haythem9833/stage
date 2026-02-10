import React, { useState, useEffect } from 'react';
import styles from '@/styles/EvaluationForm.module.css';

interface EvaluationFormProps {
  inscriptionId: number;
  formationTitle: string;
  formateurName: string;
  onSubmit: (data: EvaluationData) => void;
  onCancel: () => void;
  initialData?: EvaluationData;
  isLoading?: boolean;
}

export interface EvaluationData {
  environnement_note: number | null;
  environnement_commentaire: string;
  formateur_note: number | null;
  formateur_commentaire: string;
  formation_note: number | null;
  formation_commentaire: string;
  services_note: number | null;
  services_commentaire: string;
  suggestions: string;
}

const ScaleRating: React.FC<{
  label: string;
  value: number | null;
  onChange: (value: number) => void;
}> = ({ label, value, onChange }) => {
  const scales = [
    { value: 5, label: 'Très bien', color: '#4CAF50' },
    { value: 4, label: 'Bien', color: '#8BC34A' },
    { value: 3, label: 'Moyen', color: '#FFC107' },
    { value: 0, label: 'Non Satisfaisant', color: '#F44336' },
  ];

  return (
    <div className={styles.scaleRating}>
      <label className={styles.ratingLabel}>{label}</label>
      <div className={styles.ratingOptions}>
        {scales.map((scale) => (
          <button
            key={scale.value}
            className={`${styles.ratingButton} ${value === scale.value ? styles.active : ''}`}
            style={value === scale.value ? { backgroundColor: scale.color } : {}}
            onClick={() => onChange(scale.value)}
            type="button"
          >
            <div className={styles.ratingValue}>{scale.value}</div>
            <div className={styles.ratingText}>{scale.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

const EvaluationForm: React.FC<EvaluationFormProps> = ({
  inscriptionId,
  formationTitle,
  formateurName,
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<EvaluationData>(
    initialData || {
      environnement_note: null,
      environnement_commentaire: '',
      formateur_note: null,
      formateur_commentaire: '',
      formation_note: null,
      formation_commentaire: '',
      services_note: null,
      services_commentaire: '',
      suggestions: '',
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);

  const handleRatingChange = (field: keyof EvaluationData, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleCommentChange = (field: keyof EvaluationData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (formData.environnement_note === null) {
        newErrors.environnement_note = 'Veuillez évaluer l\'environnement';
      }
    } else if (step === 2) {
      if (formData.formateur_note === null) {
        newErrors.formateur_note = 'Veuillez évaluer le formateur';
      }
    } else if (step === 3) {
      if (formData.formation_note === null) {
        newErrors.formation_note = 'Veuillez évaluer la formation';
      }
    } else if (step === 4) {
      if (formData.services_note === null) {
        newErrors.services_note = 'Veuillez évaluer les services';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      formData.environnement_note === null ||
      formData.formateur_note === null ||
      formData.formation_note === null ||
      formData.services_note === null
    ) {
      setErrors({
        environnement_note: formData.environnement_note === null ? 'Requis' : '',
        formateur_note: formData.formateur_note === null ? 'Requis' : '',
        formation_note: formData.formation_note === null ? 'Requis' : '',
        services_note: formData.services_note === null ? 'Requis' : '',
      });
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className={styles.evaluationContainer}>
      <div className={styles.header}>
        <h2>Formulaire d'Évaluation</h2>
        <p className={styles.subtitle}>{formationTitle}</p>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${(currentStep / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Step 1: Environment */}
        {currentStep === 1 && (
          <section className={styles.section}>
            <h3>Évaluation de l'Environnement</h3>
            <p className={styles.description}>
              Accueil, salle de formation, pause, etc.
            </p>
            <ScaleRating
              label="Comment avez-vous trouvé l'environnement?"
              value={formData.environnement_note}
              onChange={(value) => handleRatingChange('environnement_note', value)}
            />
            {errors.environnement_note && (
              <p className={styles.error}>{errors.environnement_note}</p>
            )}
            <textarea
              placeholder="Commentaires optionnels..."
              value={formData.environnement_commentaire}
              onChange={(e) => handleCommentChange('environnement_commentaire', e.target.value)}
              className={styles.textarea}
              rows={3}
            />
          </section>
        )}

        {/* Step 2: Trainer */}
        {currentStep === 2 && (
          <section className={styles.section}>
            <h3>Évaluation du Formateur</h3>
            <p className={styles.description}>
              Maîtrise du sujet, qualité pédagogique, gestion des temps
            </p>
            <p className={styles.formatterName}>Formateur: <strong>{formateurName}</strong></p>
            <ScaleRating
              label="Comment avez-vous trouvé la qualité du formateur?"
              value={formData.formateur_note}
              onChange={(value) => handleRatingChange('formateur_note', value)}
            />
            {errors.formateur_note && (
              <p className={styles.error}>{errors.formateur_note}</p>
            )}
            <textarea
              placeholder="Commentaires optionnels..."
              value={formData.formateur_commentaire}
              onChange={(e) => handleCommentChange('formateur_commentaire', e.target.value)}
              className={styles.textarea}
              rows={3}
            />
          </section>
        )}

        {/* Step 3: Formation */}
        {currentStep === 3 && (
          <section className={styles.section}>
            <h3>Évaluation de la Formation</h3>
            <p className={styles.description}>
              Objectifs atteints
            </p>
            <ScaleRating
              label="Les objectifs de la formation ont-ils été atteints?"
              value={formData.formation_note}
              onChange={(value) => handleRatingChange('formation_note', value)}
            />
            {errors.formation_note && (
              <p className={styles.error}>{errors.formation_note}</p>
            )}
            <textarea
              placeholder="Commentaires optionnels..."
              value={formData.formation_commentaire}
              onChange={(e) => handleCommentChange('formation_commentaire', e.target.value)}
              className={styles.textarea}
              rows={3}
            />
          </section>
        )}

        {/* Step 4: Services */}
        {currentStep === 4 && (
          <section className={styles.section}>
            <h3>Évaluation des Services Fournis par le CNI</h3>
            <p className={styles.description}>
              La prise en charge des demandes divers des clients
            </p>
            <ScaleRating
              label="Comment évaluez-vous les services du CNI?"
              value={formData.services_note}
              onChange={(value) => handleRatingChange('services_note', value)}
            />
            {errors.services_note && (
              <p className={styles.error}>{errors.services_note}</p>
            )}
            <textarea
              placeholder="Commentaires optionnels..."
              value={formData.services_commentaire}
              onChange={(e) => handleCommentChange('services_commentaire', e.target.value)}
              className={styles.textarea}
              rows={3}
            />
          </section>
        )}

        {/* Step 5: Suggestions */}
        {currentStep === 5 && (
          <section className={styles.section}>
            <h3>Suggestions et Recommandations</h3>
            <p className={styles.description}>
              Aidez-nous à améliorer nos formations
            </p>
            <textarea
              placeholder="Vos suggestions pour l'amélioration..."
              value={formData.suggestions}
              onChange={(e) => handleCommentChange('suggestions', e.target.value)}
              className={styles.textarea}
              rows={6}
            />
            <p className={styles.summary}>
              <strong>Résumé de votre évaluation:</strong>
            </p>
            <ul className={styles.summaryList}>
              <li>Environnement: <span>{formData.environnement_note}</span></li>
              <li>Formateur: <span>{formData.formateur_note}</span></li>
              <li>Formation: <span>{formData.formation_note}</span></li>
              <li>Services: <span>{formData.services_note}</span></li>
            </ul>
          </section>
        )}

        <div className={styles.buttonGroup}>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className={styles.buttonSecondary}
              disabled={isLoading}
            >
              Précédent
            </button>
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className={styles.buttonPrimary}
              disabled={isLoading}
            >
              Suivant
            </button>
          ) : (
            <button
              type="submit"
              className={styles.buttonSuccess}
              disabled={isLoading}
            >
              {isLoading ? 'Soumission...' : 'Soumettre l\'Évaluation'}
            </button>
          )}

          <button
            type="button"
            onClick={onCancel}
            className={styles.buttonDanger}
            disabled={isLoading}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default EvaluationForm;
