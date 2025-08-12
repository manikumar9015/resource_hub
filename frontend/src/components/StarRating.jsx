import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const StarRating = ({ initialRating = 0, totalStars = 5, onRate, disabled = false }) => {
    const [hover, setHover] = useState(null);
    const [rating, setRating] = useState(initialRating);

    const handleClick = (ratingValue) => {
        if (disabled) return;
        setRating(ratingValue);
        if (onRate) {
            onRate(ratingValue);
        }
    };

    return (
        <div className="flex items-center">
            {[...Array(totalStars)].map((_, index) => {
                const ratingValue = index + 1;
                // Use white for filled stars and a dark gray for empty stars.
                const starColor = ratingValue <= (hover || rating) ? "white" : "#4B5563"; // A neutral, dark gray

                return (
                    <label key={index}>
                        <input
                            type="radio"
                            name="rating"
                            value={ratingValue}
                            onClick={() => handleClick(ratingValue)}
                            className="hidden" // Hide the actual radio button
                            disabled={disabled}
                        />
                        <FaStar
                            className="star"
                            color={starColor}
                            size={25}
                            onMouseEnter={!disabled ? () => setHover(ratingValue) : null}
                            onMouseLeave={!disabled ? () => setHover(null) : null}
                            style={{ cursor: disabled ? 'default' : 'pointer', transition: 'color 200ms' }}
                        />
                    </label>
                );
            })}
            {/* The existing text color is suitable for the new theme. */}
            <span className="ml-2 text-gray-400 text-sm">({rating.toFixed(1)})</span>
        </div>
    );
};

export default StarRating;