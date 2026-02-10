'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AuthContext } from '@/context/AuthContext';
import { api } from '@/services/api';
import PrivateRoute from '@/components/PrivateRoute';
import EvaluationForm, { EvaluationData } from '@/components/EvaluationForm';
import FormationCreateModal from '@/components/modals/FormationCreateModal';
import {
  BookOpen,
  Star,
  Calendar,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Send,
  Plus,
  TrendingUp,
  Trash2,
  Edit,
  Eye,
} from 'lucide-react';

interface Formation {
  id: number;
  titre?: string;
  nom?: string;
  description: string;
  formateur: string;
  formateur_id?: number;
  date_debut_evaluation?: string;
  date_fin_evaluation?: string;
  duree?: number;
  statut?: string;
  statut_formation?: string;
  inscrits?: number;
}

interface Inscription {
  id: number;
  formation: Formation;
  evaluation?: { id: number; status: string } | null;
  can_evaluate?: boolean;
  statut?: string;
  inscription?: Inscription;
}

const MesFormations = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  // État commun
  const [formations, setFormations] = useState<Inscription[] | Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // État étudiant
  const [selectedInscription, setSelectedInscription] = useState<Inscription | null>(null);
  const [evaluationStep, setEvaluationStep] = useState<'list' | 'form' | 'success'>('list');
  const [evaluatingId, setEvaluatingId] = useState<number | null>(null);
  const [evaluations, setEvaluations] = useState<Record<number, { note: string; commentaire: string }>>({});
  const [submitting, setSubmitting] = useState(false);

  // État formateur
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFormation, setEditingFormation] = useState<Formation | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const userRole = user?.role?.toLowerCase();

  // Calculer les formations du formateur
  const myFormations = useMemo(() => {
    if (userRole !== 'formateur') return formations;
    const myId = user?.id;
    if (!myId) return [];
    return (formations as Formation[]).filter((f) => Number(f.formateur_id) === Number(myId));
  }, [formations, user?.id, userRole]);

  // Calculer les stats du formateur
  const stats = useMemo(() => {
    if (userRole !== 'formateur') return null;
    const myForms = myFormations as Formation[];
    return {
      total: myForms.length,
      totalInscrits: myForms.reduce((acc, f) => acc + (f.inscrits || 0), 0),
      published: myForms.filter((f) => f.statut === 'publie').length,
      draft: myForms.filter((f) => f.statut === 'brouillon').length,
    };
  }, [myFormations, userRole]);

  useEffect(() => {
    fetchFormations();
  }, [userRole]);

  const fetchFormations = async () => {
    try {
      setLoading(true);
      setError(null);

      if (userRole === 'etudiant') {
        // Récupérer les inscriptions de l'étudiant
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
                inscription: inscription,
                statut: inscription.statut,
                can_evaluate: inscription.can_evaluate,
                evaluation: inscription.evaluation,
              };
            }
          }
        });

        setFormations(Object.values(formationsMap));
      } else if (userRole === 'formateur') {
        // Récupérer les formations du formateur
        const res = await api.get('/formations');
        setFormations(res.data?.data || res.data || []);
      }
    } catch (err) {
      console.error('Erreur chargement formations:', err);
      setError('Erreur lors du chargement des formations');
      setFormations([]);
    } finally {
      setLoading(false);
    }
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
      console.error('Error starting evaluation:', err);
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
        fetchFormations();
      }, 3000);
    } catch (err) {
      console.error('Error submitting evaluation:', err);
      setError('Erreur lors de la soumission de l\'évaluation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEvaluation = () => {
    setEvaluationStep('list');
    setSelectedInscription(null);
  };

  const handleEvaluation = async (inscriptionId: number) => {
    const note = evaluations[inscriptionId]?.note;
    const commentaire = evaluations[inscriptionId]?.commentaire;

    if (!note) {
      setError('Veuillez sélectionner une note');
      return;
    }

    try {
      setEvaluatingId(inscriptionId);
      await api.post('/evaluations', {
        inscription_id: inscriptionId,
        note: parseInt(note),
        commentaire: commentaire || null,
      });

      setSuccess('Évaluation enregistrée avec succès!');
      setEvaluations((prev) => ({
        ...prev,
        [inscriptionId]: { note: '', commentaire: '' },
      }));

      setTimeout(() => {
        setSuccess(null);
        fetchFormations();
      }, 2000);
    } catch (err) {
      console.error(err);
      setError((err as any).response?.data?.message || 'Erreur lors de l\'enregistrement de l\'évaluation');
    } finally {
      setEvaluatingId(null);
    }
  };

  const isEvaluationOpen = (formation: Formation): boolean => {
    const statut = (formation as any).statut_formation || '';
    if (typeof statut === 'string' && statut.toLowerCase().includes('term')) return false;
    // Allow evaluation as long as the trainer hasn't marked the formation as finished
    return true;
  };

  const handleOpenModal = () => {
    setEditingFormation(null);
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handleEditFormation = (formation: Formation) => {
    setEditingFormation(formation);
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFormation(null);
    setError(null);
  };

  const handleSubmit = async (formData: any) => {
    try {
      setSubmitting(true);
      setError(null);

      if (editingFormation) {
        await api.put(`/formations/${editingFormation.id}`, formData);
        setSuccess('Formation modifiée avec succès !');
      } else {
        await api.post('/formations', formData);
        setSuccess('Formation créée avec succès !');
      }

      await fetchFormations();
      handleCloseModal();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      setError((err as any).response?.data?.message || 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFormation = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) return;
    try {
      setDeletingId(id);
      setError(null);
      await api.delete(`/formations/${id}`);
      setSuccess('Formation supprimée avec succès !');
      await fetchFormations();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erreur suppression:', err);
      setError((err as any).response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  // Vue étudiant - formulaire d'évaluation
  if (userRole === 'etudiant' && evaluationStep === 'form' && selectedInscription) {
    return (
      <EvaluationForm
        inscriptionId={selectedInscription.id}
        formationTitle={selectedInscription.formation.titre || ''}
        formateurName={selectedInscription.formation.formateur}
        onSubmit={handleSubmitEvaluation}
        onCancel={handleCancelEvaluation}
        isLoading={submitting}
      />
    );
  }

  // Vue étudiant - succès
  if (userRole === 'etudiant' && evaluationStep === 'success') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✓</div>
          <h2>Merci pour votre évaluation!</h2>
          <p>Votre avis nous aide à améliorer nos formations.</p>
          <p style={{ color: '#6b7280' }}>Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <PrivateRoute roles={['etudiant', 'formateur']}>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', padding: '24px' }}>
        {/* Alertes */}
        {error && (
          <div style={{ padding: '16px 20px', borderRadius: '10px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '20px' }}>
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

        {userRole === 'etudiant' && (
          <>
            {/* En-tête étudiant */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                <div style={{ width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)' }}>
                  <BookOpen />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1a1a2e', margin: '0' }}>Mes Formations</h1>
              </div>
              <p style={{ color: '#6b7280', margin: '0' }}>Suivez vos formations et évaluez vos expériences</p>
              <button onClick={fetchFormations} disabled={loading} style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'white', color: '#667eea', border: '2px solid #667eea', borderRadius: '10px', fontSize: '0.9375rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                <RefreshCw size={20} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                <span>Actualiser</span>
              </button>
            </div>

            {/* Contenu étudiant */}
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '16px', background: 'white', borderRadius: '16px' }}>
                <RefreshCw size={48} style={{ color: '#667eea', animation: 'spin 1s linear infinite' }} />
                <span>Chargement de vos formations...</span>
              </div>
            ) : (formations as Inscription[]).length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '16px', background: 'white', borderRadius: '16px' }}>
                <BookOpen size={64} style={{ color: '#9ca3af' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1a1a2e', margin: '0' }}>Aucune formation en cours</h3>
                <p style={{ fontSize: '0.9375rem', color: '#9ca3af', margin: '0' }}>Inscrivez-vous à une formation pour commencer</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {(formations as Inscription[]).map((item) => {
                  const formation = item.formation;
                  const canEvaluate = item.can_evaluate;
                  const isOpen = isEvaluationOpen(formation);
                  const isCompleted = item.evaluation?.status === 'completed';

                  return (
                    <div key={item.id} style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', transition: 'all 0.3s ease' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1a1a2e', margin: '0' }}>{formation.titre}</h3>
                        <div>
                          {isCompleted && (
                            <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', background: '#d1fae5', color: '#065f46' }}>
                              ✓ Complétée
                            </span>
                          )}
                          {isOpen && !isCompleted && (
                            <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', background: '#dbeafe', color: '#1e40af' }}>
                              Évaluation ouverte
                            </span>
                          )}
                          {!isOpen && !isCompleted && (
                            <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', background: '#fef3c7', color: '#92400e' }}>
                              Évaluation fermée
                            </span>
                          )}
                        </div>
                      </div>

                      <p style={{ color: '#6b7280', margin: '0 0 16px 0' }}>{formation.description}</p>

                      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9375rem', color: '#6b7280' }}>
                          <Users size={16} style={{ color: '#667eea' }} />
                          <span>{formation.inscrits || 0} inscrits</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9375rem', color: '#6b7280' }}>
                          <Clock size={16} style={{ color: '#667eea' }} />
                          <span>{formation.duree} heures</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9375rem', color: '#6b7280' }}>
                          <Users size={16} style={{ color: '#667eea' }} />
                          <span>Statut: {item.statut}</span>
                        </div>
                      </div>

                      {formation.statut_formation === 'commencee' && (
                        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.0625rem', fontWeight: '700', color: '#1a1a2e', margin: '0 0 16px 0' }}>
                            <Star size={20} />
                            Évaluer cette formation
                          </h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <label style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1a1a2e' }}>Note (0 à 5 étoiles)</label>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {[0, 1, 2, 3, 4, 5].map((num) => (
                                  <button
                                    key={num}
                                    onClick={() =>
                                      setEvaluations((prev) => ({
                                        ...prev,
                                        [item.id]: {
                                          ...prev[item.id],
                                          note: String(num),
                                        },
                                      }))
                                    }
                                    style={{
                                      width: '40px',
                                      height: '40px',
                                      border: evaluations[item.id]?.note === String(num) ? '2px solid #667eea' : '2px solid #e2e8f0',
                                      borderRadius: '8px',
                                      background: evaluations[item.id]?.note === String(num) ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                                      color: evaluations[item.id]?.note === String(num) ? 'white' : 'inherit',
                                      cursor: 'pointer',
                                      fontSize: '1.5rem',
                                      transition: 'all 0.2s ease',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    ⭐
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <label style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1a1a2e' }}>Commentaire (optionnel)</label>
                              <textarea
                                value={evaluations[item.id]?.commentaire || ''}
                                onChange={(e) =>
                                  setEvaluations((prev) => ({
                                    ...prev,
                                    [item.id]: {
                                      ...prev[item.id],
                                      commentaire: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="Partagez votre avis sur cette formation..."
                                maxLength={1000}
                                style={{ padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9375rem', fontFamily: 'inherit', resize: 'vertical', minHeight: '100px', transition: 'border-color 0.2s ease' }}
                              />
                            </div>

                            <button
                              onClick={() => handleEvaluation(item.id)}
                              disabled={evaluatingId === item.id || !evaluations[item.id]?.note}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
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
                                alignSelf: 'flex-start',
                                opacity: evaluatingId === item.id || !evaluations[item.id]?.note ? 0.6 : 1,
                              }}
                            >
                              {evaluatingId === item.id ? (
                                <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                              ) : (
                                <>
                                  <Send size={20} />
                                  <span>Envoyer l'évaluation</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {userRole === 'formateur' && (
          <>
            {/* En-tête formateur */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '32px', marginBottom: '32px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', color: '#667eea', background: 'rgba(102, 126, 234, 0.1)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1a1a2e', margin: '0' }}>Mes Formations</h1>
                    <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Gérez vos formations et suivez les inscriptions</p>
                  </div>
                </div>
                <button
                  onClick={handleOpenModal}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.9375rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease' }}
                >
                  <Plus size={20} /> Créer une formation
                </button>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {[
                  { label: 'Total', value: stats.total, bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                  { label: 'Publiées', value: stats.published, bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
                  { label: 'Brouillons', value: stats.draft, bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
                  { label: 'Inscrits', value: stats.totalInscrits, bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
                ].map((stat, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}>
                    <div style={{ width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', color: 'white', background: stat.bg, flexShrink: 0 }}>
                      {i === 0 && <BookOpen size={28} />}
                      {i === 1 && <CheckCircle size={28} />}
                      {i === 2 && <Edit size={28} />}
                      {i === 3 && <Users size={28} />}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1a1a2e' }}>{stat.value}</span>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{stat.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Formations */}
            {loading ? (
              <div style={{ background: 'white', borderRadius: '16px', padding: '60px 24px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}>
                <RefreshCw size={48} style={{ color: '#667eea', marginBottom: '16px', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : (myFormations as Formation[]).length === 0 ? (
              <div style={{ background: 'white', borderRadius: '16px', padding: '60px 24px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}>
                <BookOpen size={64} style={{ color: '#d1d5db', marginBottom: '16px' }} />
                <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '24px' }}>Aucune formation trouvée</p>
                <button
                  onClick={handleOpenModal}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.9375rem', fontWeight: '600', cursor: 'pointer' }}
                >
                  <Plus size={20} /> Créer votre première formation
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                {(myFormations as Formation[]).map((formation) => (
                  <div key={formation.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1a1a2e', margin: '0', flex: '1' }}>{formation.nom || formation.titre}</h3>
                        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap', background: formation.statut === 'publie' ? '#dcfce7' : '#fef3c7', color: formation.statut === 'publie' ? '#16a34a' : '#d97706' }}>
                          {formation.statut === 'publie' ? 'Publiée' : 'Brouillon'}
                        </span>
                      </div>
                    </div>

                    <div style={{ padding: '20px', flex: '1' }}>
                      <p style={{ color: '#6b7280', margin: '0 0 16px 0', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {formation.description}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '0.875rem' }}>
                          <Users size={16} />
                          <span>{formation.inscrits || 0} inscrits</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '0.875rem' }}>
                          <Clock size={16} />
                          <span>{formation.duree || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button onClick={() => handleEditFormation(formation)} style={{ flex: '1', minWidth: '100px', padding: '10px 16px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Edit size={16} /> Modifier
                      </button>
                      <Link href={`/formateur/formations/${formation.id}`} style={{ flex: '1', minWidth: '100px', padding: '10px 16px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>
                        <Eye size={16} /> Voir
                      </Link>
                      <button onClick={() => handleDeleteFormation(formation.id)} disabled={deletingId === formation.id} style={{ flex: '1', minWidth: '100px', padding: '10px 16px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: deletingId === formation.id ? 0.6 : 1 }}>
                        <Trash2 size={16} /> {deletingId === formation.id ? 'Suppression...' : 'Supprimer'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal */}
            {isModalOpen && (
              <FormationCreateModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                isSubmitting={submitting}
                initialData={editingFormation}
                error={error}
              />
            )}
          </>
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

export default MesFormations;
