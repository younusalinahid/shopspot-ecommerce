import React, { useEffect, useState } from "react";
import { Star, Trash2, ShoppingBag } from "lucide-react";
import {
    addOrUpdateReview,
    getReviewsByProduct,
    getReviewSummary,
    deleteReview,
    canUserReview
} from "../../api/reviewApi";
import { getProductSentiment } from '../../api/reviewApi';
import { Sparkles, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';

const StarRating = ({ value, onChange, readonly = false }) => {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-6 h-6 transition-colors duration-150
                        ${star <= (hovered || value)
                        ? "text-amber-400 fill-current"
                        : "text-gray-300 dark:text-gray-600"}
                        ${!readonly ? "cursor-pointer hover:scale-110 transition-transform" : ""}
                    `}
                    onClick={() => !readonly && onChange && onChange(star)}
                    onMouseEnter={() => !readonly && setHovered(star)}
                    onMouseLeave={() => !readonly && setHovered(0)}
                />
            ))}
        </div>
    );
};

const ReviewSection = ({ productId, currentUserEmail, currentUserName, onSummaryUpdate }) => {
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 });
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [canReview, setCanReview] = useState(false);
    const [checkingPurchase, setCheckingPurchase] = useState(false);
    const [sentiment,        setSentiment]        = useState(null);
    const [sentimentLoading, setSentimentLoading] = useState(false);

    const fetchData = async () => {
        try {
            const [reviewRes, summaryRes] = await Promise.all([
                getReviewsByProduct(productId),
                getReviewSummary(productId)
            ]);
            setReviews(reviewRes.data);
            const newSummary = summaryRes.data;
            setSummary(newSummary);
            if (onSummaryUpdate && newSummary) {
                onSummaryUpdate(newSummary);
            }
            if (reviewRes.data?.length >= 3) {
                setSentimentLoading(true);
                getProductSentiment(productId)
                    .then(data => setSentiment(data))
                    .finally(() => setSentimentLoading(false));
            }
        } catch {
            console.error("Failed to load reviews");
        }
    };

    const checkUserCanReview = async () => {
        if (!currentUserEmail) {
            setCanReview(false);
            setCheckingPurchase(false);
            return;
        }

        try {
            const response = await canUserReview(productId);
            setCanReview(response.data.canReview);
        } catch (error) {
            console.error("Failed to check purchase status:", error);
            setCanReview(false);
        } finally {
            setCheckingPurchase(false);
        }
    };

    useEffect(() => {
        if (productId) fetchData();
    }, [productId]);

    useEffect(() => {
        if (productId && currentUserEmail) {
            setCheckingPurchase(true);
            canUserReview(productId)
                .then(result => setCanReview(result))
                .finally(() => setCheckingPurchase(false));
        } else {
            setCanReview(false);
        }
    }, [productId, currentUserEmail]);

    const handleSubmit = async () => {
        if (rating === 0) return setError("Please select a star rating.");
        if (!canReview) return setError("You can only review products you have purchased.");

        setLoading(true);
        setError("");
        try {
            await addOrUpdateReview(productId, { rating, comment });
            setRating(0);
            setComment("");
            await fetchData();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit review. Please try again.");
        }
        setLoading(false);
    };

    const handleDelete = async (reviewId) => {
        try {
            await deleteReview(reviewId);
            await fetchData();
        } catch {
            console.error("Failed to delete review");
        }
    };

    const renderReviewForm = () => {
        // Not logged in
        if (!currentUserEmail) {
            return (
                <div className="mb-10 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                        Please sign in to write a review.
                    </p>
                </div>
            );
        }

        // Checking purchase status
        if (checkingPurchase) {
            return (
                <div className="mb-10 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
                    <p className="text-gray-400 text-sm">Checking purchase status...</p>
                </div>
            );
        }

        // Logged in but hasn't purchased
        if (!canReview) {
            return (
                <div className="mb-10 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 text-center">
                    <p className="text-amber-700 dark:text-amber-400 font-medium">
                        🛒 Purchase required
                    </p>
                    <p className="text-amber-600 dark:text-amber-500 text-sm mt-1">
                        You can only review products you have purchased and paid for.
                    </p>
                </div>
            );
        }

        return (
            <div className="mb-10 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Write a Review
                </h3>
                <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Rating</p>
                    <StarRating value={rating} onChange={setRating} />
                </div>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                        placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
                {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="mt-4 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400
                        text-white px-8 py-3 rounded-xl font-semibold transition-all
                        duration-300 hover:scale-105 disabled:scale-100"
                >
                    {loading ? "Submitting..." : "Submit Review"}
                </button>
            </div>
        );
    };

    const renderRatingBars = () => {
        return [5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
                <div key={star} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-4">{star}</span>
                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 w-6">{count}</span>
                </div>
            );
        });
    };

    return (
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 transition-colors duration-300">
                Reviews & Ratings
            </h2>

            {/* Summary */}
            <div className="flex flex-col md:flex-row gap-8 mb-10 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex flex-col items-center justify-center min-w-[120px]">
                    <span className="text-6xl font-bold text-gray-900 dark:text-white">
                        {summary.averageRating?.toFixed(1) || "0.0"}
                    </span>
                    <StarRating value={Math.round(summary.averageRating || 0)} readonly />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {summary.totalReviews || 0} {summary.totalReviews === 1 ? "review" : "reviews"}
                    </p>
                </div>
                <div className="flex-1 space-y-2">
                    {renderRatingBars()}
                </div>
            </div>

            {/* Review Form */}
            {currentUserEmail ? (
                <div className="mb-10 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Write a Review
                    </h3>
                    <div className="mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Rating</p>
                        <StarRating value={rating} onChange={setRating} />
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this product..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 resize-none transition-colors duration-300"
                    />
                    {error && (
                        <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>
                    )}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="mt-4 bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:scale-100"
                    >
                        {loading ? "Submitting..." : "Submit Review"}
                    </button>
                </div>
            ) : (
                <div className="mb-10 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                        Please SignIn
                        to write a review.
                    </p>
                </div>
            )}

            {/* ── AI Sentiment Analysis Card ── */}
            {sentimentLoading && (
                <div className="mb-8 p-5 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-2xl flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-purple-500 animate-spin flex-shrink-0" />
                    <span className="text-sm text-purple-600 dark:text-purple-400">
            AI is analyzing reviews...
        </span>
                </div>
            )}

            {sentiment && !sentimentLoading && (
                <div className="mb-8 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/10
        border border-purple-200 dark:border-purple-800 rounded-2xl p-6">

                    {/* Header */}
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        <h3 className="font-bold text-gray-900 dark:text-white">
                            AI Review Analysis
                        </h3>
                        <span className="text-xs text-gray-400 ml-auto">
                Based on {sentiment.totalReviews} reviews
            </span>
                    </div>

                    {/* Score bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                <span className={`font-semibold
                    ${sentiment.sentiment === 'POSITIVE' ? 'text-green-600' :
                    sentiment.sentiment === 'NEGATIVE' ? 'text-red-600' :
                        'text-amber-600'}`}>
                    {sentiment.sentiment === 'POSITIVE' ? '😊 Mostly Positive' :
                        sentiment.sentiment === 'NEGATIVE' ? '😞 Mostly Negative' :
                            '😐 Mixed Reviews'}
                </span>
                            <span className="font-bold text-gray-700 dark:text-gray-300">
                    {sentiment.score}%
                </span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700
                        ${sentiment.sentiment === 'POSITIVE' ? 'bg-green-500' :
                                    sentiment.sentiment === 'NEGATIVE' ? 'bg-red-500' :
                                        'bg-amber-500'}`}
                                style={{ width: `${sentiment.score}%` }}
                            />
                        </div>
                    </div>

                    {/* Pros & Cons */}
                    {(sentiment.pros?.length > 0 || sentiment.cons?.length > 0) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            {sentiment.pros?.length > 0 && (
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <ThumbsUp className="w-4 h-4 text-green-600" />
                                        <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">
                                Pros
                            </span>
                                    </div>
                                    <ul className="space-y-1">
                                        {sentiment.pros.map((pro, i) => (
                                            <li key={i} className="text-sm text-green-800 dark:text-green-300 flex items-start gap-1.5">
                                                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                                {pro}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {sentiment.cons?.length > 0 && (
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <ThumbsDown className="w-4 h-4 text-red-600" />
                                        <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">
                                Cons
                            </span>
                                    </div>
                                    <ul className="space-y-1">
                                        {sentiment.cons.map((con, i) => (
                                            <li key={i} className="text-sm text-red-800 dark:text-red-300 flex items-start gap-1.5">
                                                <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span>
                                                {con}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Summary */}
                    {sentiment.summary && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                            {sentiment.summary}
                        </p>
                    )}

                    {/* Recommendation */}
                    {sentiment.recommendation && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-2.5 flex items-start gap-2">
                            <span className="text-lg flex-shrink-0">💡</span>
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                {sentiment.recommendation}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No reviews yet. Be the first to review this product!
                </p>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 transition-colors duration-300"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {review.userFullName}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {review.createdAt}
                                    </p>
                                </div>
                                {review.userFullName === currentUserName && (
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200 p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <StarRating value={review.rating} readonly />
                            {review.comment && (
                                <p className="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {review.comment}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewSection;