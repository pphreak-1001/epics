import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Star, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

function ReviewModal({ job, targetUser, targetRole, onClose, onSuccess, isWorker }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert(t('pleaseSelectRating') || "Please select a rating.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      // If worker, mark job complete first
      if (isWorker) {
        try {
          await axios.post(`${API_URL}/reviews/job-complete/${job.job_id}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch(err) {
          console.warn("Could not mark job complete, continuing to rating", err);
        }
      }

      const res = await axios.post(`${API_URL}/reviews/rate`, {
        job_id: job.job_id,
        target_user_id: targetUser.user_id || targetUser.employer_id, // depends on if it's the job obj or worker obj
        rating: rating,
        comment: comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.is_target_blocked) {
        alert(t('userBlocked') || `Thanks for the review. Due to multiple poor ratings, this user has been blocked.`);
      } else {
        alert(t('reviewSubmitted') || "Review submitted successfully!");
      }
      
      onSuccess();
    } catch (err) {
      console.error(err);
      alert(t('reviewError') || "Could not submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const targetName = targetUser.name || (targetRole === 'employer' ? "Employer" : "Worker");

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-saffron to-orange-600 text-white p-6 relative">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{isWorker ? (t('completeAndRate') || "Complete & Rate") : (t('rateUser') || "Rate User")}</h2>
            <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="opacity-90 mt-1">{t('rate') || "Rate"} {targetName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-gray-700 font-medium mb-3">{t('howWasExperience') || "How was your experience?"}</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(rating)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hover || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('addComment') || "Add a comment (optional)"}</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('commentPlaceholder') || "E.g., Great experience, or faced issues with payment..."}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all text-gray-700 resize-none h-28"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading || rating === 0}
            className="w-full bg-gradient-to-r from-saffron to-orange-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center disabled:opacity-50 disabled:transform-none"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (t('submitReview') || "Submit Review")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReviewModal;
