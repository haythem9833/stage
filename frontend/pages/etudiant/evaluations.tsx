'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '@/services/api';
import PrivateRoute from '@/components/PrivateRoute';
import EvaluationForm, { EvaluationData } from '@/components/EvaluationForm';
import {
  BookOpen,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Star,
} from 'lucide-react';

interface Formation {
  id: number;
  titre: string;
  description: string;
  formateur: string;
  date_debut_evaluation?: string;
  date_fin_evaluation?: string;
  duree?: number;
  statut_formation?: string;
  inscrits?: number;
}

interface Inscription {
  id: number;
  formation: Formation;
  evaluation?: {
    id: number;
    status: string;
  } | null;
  can_evaluate?: boolean;
  statut?: string;
}

type Step = 'list' | 'form' | 'success';

const EvaluationsPage: React.FC = () => {
  const router = useRouter();
  const [formations, setFormations] = useState<Inscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [evaluationStep, setEvaluationStep] = useState<Step>('list');
  const [selectedInscription, setSelectedInscription] = useState<Inscription | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/my-inscriptions');
      const inscriptions = res.data || [];

      // Mapper les inscriptions avec leurs formations
      const formationsMap: Record<number, Inscription> = {};
      inscriptions.forEach((inscription: Inscription) => {
        if (inscription.formation) {
          const key = inscription.formation.id;
          if (!formationsMap[key]) {
            formationsMap[key] = {
              id: inscription.id,
              formation: inscription.formation,
              statut: inscription.statut,
              can_evaluate: inscription.can_evaluate,
              evaluation: inscription.evaluation,
            };
          }
        }
      });

      setFormations(Object.values(formationsMap));
    } catch (err) {
      console.error('Erreur chargement formations:', err);
      setError('Erreur lors du chargement de vos formations');
      setFormations([]);
    } finally {
      setLoading(false);
    }
  };

  const isEvaluationOpen = (formation: Formation): boolean => {
    const statut = (formation as any).statut_formation || '';
    if (typeof statut === 'string' && statut.toLowerCase().includes('term')) return false;
    // Allow evaluation as long as the trainer hasn't marked the formation as finished
    return true;
  };

  const handleStartEvaluation = async (inscription: Inscription) => {
    try {
      if (!inscription.evaluation) {
        setSubmitting(true);
        await api.post(`/inscriptions/${inscription.id}/evaluation/create`);
        await fetchFormations();
      }
      setSelectedInscription(inscription);
      setEvaluationStep('form');
    } catch (err) {
      console.error('Erreur start evaluation:', err);
      setError('Erreur lors de la création de l\'évaluation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEvaluation = async (data: EvaluationData) => {
    if (!selectedInscription?.evaluation) return;

    try {
      setSubmitting(true);
      await api.post(`/evaluations/${selectedInscription.evaluation.id}/submit`, data);
      setEvaluationStep('success');
      setTimeout(() => {
        setEvaluationStep('list');
        setSelectedInscription(null);
        setSuccess(null);
        fetchFormations();
      }, 3000);
    } catch (err) {
      console.error('Erreur submit evaluation:', err);
      setError('Erreur lors de la soumission de l\'évaluation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEvaluation = () => {
    setEvaluationStep('list');
    setSelectedInscription(null);
  };

  // Vue formulaire d'évaluation
  if (evaluationStep === 'form' && selectedInscription) {
    return (
      <PrivateRoute roles={['etudiant']}>
        <EvaluationForm
          inscriptionId={selectedInscription.id}
          formationTitle={selectedInscription.formation.titre}
          formateurName={selectedInscription.formation.formateur}
          onSubmit={handleSubmitEvaluation}
          onCancel={handleCancelEvaluation}
          isLoading={submitting}
        />
      </PrivateRoute>
    );
  }

  // Vue succès
  if (evaluationStep === 'success') {
    return (
      <PrivateRoute roles={['etudiant']}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)' }}>
          <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✓</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a2e', margin: '0 0 8px 0' }}>
              Merci pour votre évaluation!
            </h2>
            <p style={{ color: '#6b7280', margin: '0 0 8px 0' }}>
              Votre avis nous aide à améliorer nos formations.
            </p>
            <p style={{ color: '#9ca3af', margin: '0' }}>Redirection en cours...</p>
          </div>
        </div>
      </PrivateRoute>
    );
  }

  // Vue liste des formations
  return (
    <PrivateRoute roles={['etudiant']}>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', padding: '24px' }}>
        {/* En-tête */}
        <div style={{ marginBottom: '32px' }}>
          <button
            onClick={() => router.push('/etudiant/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '8px 16px', background: 'white', color: '#667eea', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9375rem', fontWeight: '600', transition: 'all 0.3s ease' }}
          >
            <ArrowLeft size={20} /> Retour
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)' }}>
              <Star size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a2e', margin: '0' }}>
                Évaluer mes formations
              </h1>
              <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>
                Partagez votre avis sur vos formations
              </p>
            </div>
          </div>

          <button
            onClick={fetchFormations}
            disabled={loading}
            style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'white', color: '#667eea', border: '2px solid #667eea', borderRadius: '10px', fontSize: '0.9375rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease' }}
          >
            <RefreshCw size={20} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Actualiser</span>
          </button>
        </div>

        {/* Alertes */}
        {error && (
          <div style={{ padding: '16px 20px', borderRadius: '10px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}>
            <AlertCircle size={20} />
            <span style={{ flex: 1 }}>{error}</span>
            <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '20px', padding: '4px' }}>
              ×
            </button>
          </div>
        )}
        {success && (
          <div style={{ padding: '16px 20px', borderRadius: '10px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }}>
            <CheckCircle size={20} />
            <span>{success}</span>
          </div>
        )}

        {/* Contenu */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '16px', background: 'white', borderRadius: '16px' }}>
            <RefreshCw size={48} style={{ color: '#667eea', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: '#6b7280' }}>Chargement de vos formations...</span>
          </div>
        ) : formations.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '16px', background: 'white', borderRadius: '16px' }}>
            <BookOpen size={64} style={{ color: '#9ca3af' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a1a2e', margin: '0' }}>
              Aucune formation disponible
            </h3>
            <p style={{ fontSize: '0.9375rem', color: '#9ca3af', margin: '0' }}>
              Inscrivez-vous à une formation pour pouvoir l'évaluer
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {formations.map((item) => {
              const formation = item.formation;
              const canEvaluate = item.can_evaluate;
              const isOpen = isEvaluationOpen(formation);
              const isCompleted = item.evaluation?.status === 'completed';

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1a1a2e', margin: '0' }}>
                      {formation.titre}
                    </h2>
                    <div>
                      {isCompleted && (
                        <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', background: '#d1fae5', color: '#065f46', whiteSpace: 'nowrap' }}>
                          ✓ Complétée
                        </span>
                      )}
                      {isOpen && !isCompleted && (
                        <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', background: '#dbeafe', color: '#1e40af', whiteSpace: 'nowrap' }}>
                          Évaluation ouverte
                        </span>
                      )}
                      {!isOpen && !isCompleted && (
                        <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', background: '#fef3c7', color: '#92400e', whiteSpace: 'nowrap' }}>
                          Évaluation fermée
                        </span>
                      )}
                    </div>
                  </div>

                  <p style={{ color: '#6b7280', margin: '0 0 16px 0', lineHeight: '1.6' }}>
                    {formation.description}
                  </p>

                  <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9375rem', color: '#6b7280' }}>
                      <strong>Formateur:</strong>{' '}
                      {formation.formateur && typeof formation.formateur === 'object'
                        ? `${(formation.formateur as any).prenom ?? ''} ${(formation.formateur as any).nom ?? ''}`.trim()
                        : (formation.formateur ?? '-')}
                    </div>
                    {formation.duree && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9375rem', color: '#6b7280' }}>
                        <strong>Durée:</strong> {formation.duree}h
                      </div>
                    )}
                    {formation.inscrits && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9375rem', color: '#6b7280' }}>
                        <strong>Inscrits:</strong> {formation.inscrits}
                      </div>
                    )}
                  </div>

                  {canEvaluate && isOpen && !isCompleted ? (
                    <button
                      onClick={() => handleStartEvaluation(item)}
                      disabled={submitting}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        opacity: submitting ? 0.6 : 1,
                      }}
                    >
                      <Star size={20} />
                      <span>Évaluer cette formation</span>
                    </button>
                  ) : isCompleted ? (
                    <div style={{ padding: '12px 24px', background: '#d1fae5', color: '#065f46', borderRadius: '10px', fontSize: '0.9375rem', fontWeight: '600' }}>
                      ✓ Vous avez évalué cette formation
                    </div>
                  ) : !isOpen ? (
                    <div style={{ padding: '12px 24px', background: '#fef3c7', color: '#92400e', borderRadius: '10px', fontSize: '0.9375rem', fontWeight: '600' }}>
                      La période d'évaluation est terminée
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </PrivateRoute>
  );
};

export default EvaluationsPage;
