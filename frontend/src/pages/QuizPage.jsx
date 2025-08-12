import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import resourceService from '../api/resource';
import { generateQuizFromBlob } from '../utils/quizHelper';
import { FiLoader, FiCheckCircle, FiXCircle, FiRepeat } from 'react-icons/fi';

const QuizPage = () => {
    const { resourceId } = useParams();
    const { user } = useContext(AuthContext);

    const [quizState, setQuizState] = useState('loading'); // loading, generating, active, finished, error
    const [quizData, setQuizData] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [score, setScore] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let isCancelled = false;
        const setupQuiz = async () => {
            try {
                setQuizState('loading');
                const detailsRes = await resourceService.getById(resourceId, user.token);
                const { fileUrl } = detailsRes.data;

                if (isCancelled) return;
                const fileRes = await axios.get(fileUrl, { responseType: 'blob' });
                const fileBlob = fileRes.data;

                if (isCancelled) return;
                setQuizState('generating');
                const quizJson = await generateQuizFromBlob(fileBlob, fileRes.headers['content-type']);

                if (!isCancelled) {
                    if (quizJson && quizJson.questions && quizJson.questions.length > 0) {
                        setQuizData(quizJson);
                        setQuizState('active');
                    } else {
                        throw new Error("Received an invalid quiz structure from the AI.");
                    }
                }
            } catch (err) {
                console.error("Quiz setup failed:", err);
                if (!isCancelled) {
                    setErrorMessage(err.message || "An unknown error occurred.");
                    setQuizState('error');
                }
            }
        };
        
        setupQuiz();
        return () => {
            isCancelled = true;
        };
    }, [resourceId, user.token]);

    const handleAnswerSelect = (selectedIndex) => {
        const isCorrect = selectedIndex === quizData.questions[currentQuestionIndex].correctAnswer;
        if (isCorrect) {
            setScore(prev => prev + 1);
        }
        setUserAnswers([...userAnswers, { question: currentQuestionIndex, selected: selectedIndex, correct: isCorrect }]);

        const nextQuestion = currentQuestionIndex + 1;
        setTimeout(() => {
            if (nextQuestion < quizData.questions.length) {
                setCurrentQuestionIndex(nextQuestion);
            } else {
                setQuizState('finished');
            }
        }, 1200); // Increased delay for better feedback visibility
    };

    const handleRestartQuiz = () => {
        setQuizState('active');
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setScore(0);
    };

    // --- RENDER LOGIC ---

    if (quizState === 'loading' || quizState === 'generating') {
        return (
            <div className="flex flex-col items-center justify-center text-center h-64">
                <FiLoader className="text-5xl text-white animate-spin mb-4" />
                <h2 className="text-2xl font-bold text-white">{quizState === 'loading' ? 'Loading Resource...' : 'Generating Quiz with AI...'}</h2>
                <p className="text-gray-400">This might take a moment.</p>
            </div>
        );
    }

    if (quizState === 'error') {
        return (
            <div className="text-center h-64 bg-[#181818] p-8 rounded-lg border border-[#282828] flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-white">Quiz Generation Failed</h2>
                <p className="text-gray-400 mt-2">{errorMessage}</p>
            </div>
        );
    }

    if (quizState === 'finished') {
        return (
            <div className="text-center bg-[#181818] p-8 rounded-lg border border-[#282828] shadow-xl">
                <h2 className="text-4xl font-bold text-white mb-4">Quiz Complete!</h2>
                <p className="text-2xl text-white mb-6">
                    Your Score: <span className="font-bold text-white">{score}</span> / <span className="font-bold text-gray-400">{quizData.questions.length}</span>
                </p>
                <button 
                    onClick={handleRestartQuiz} 
                    className="flex items-center justify-center mx-auto gap-2 bg-white hover:bg-gray-300 text-black font-bold py-3 px-6 rounded-full transition-colors cursor-pointer"
                >
                    <FiRepeat /> Try Again
                </button>
            </div>
        );
    }

    if (quizState === 'active' && quizData) {
        const currentQuestion = quizData.questions[currentQuestionIndex];
        const answerForThisQuestion = userAnswers.find(a => a.question === currentQuestionIndex);

        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-[#181818] p-8 rounded-lg border border-[#282828] shadow-xl">
                    <div className="mb-6">
                        <p className="text-gray-400 text-lg">Question {currentQuestionIndex + 1} of {quizData.questions.length}</p>
                        <h2 className="text-2xl font-semibold text-white mt-2">{currentQuestion.question}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option, index) => {
                            let buttonClass = "w-full text-left p-4 rounded-lg transition-all duration-300 border cursor-pointer";

                            if (answerForThisQuestion) {
                                const isCorrectAnswer = index === currentQuestion.correctAnswer;
                                const isSelectedAnswer = index === answerForThisQuestion.selected;

                                if (isCorrectAnswer) {
                                    // Correct answer is always highlighted with a solid white look
                                    buttonClass += " bg-white text-black border-white";
                                } else if (isSelectedAnswer) {
                                    // User's incorrect choice is a flat dark gray
                                    buttonClass += " bg-gray-900 border-gray-800 text-gray-500";
                                } else {
                                    // Other options are faded out
                                    buttonClass += " border-transparent opacity-40";
                                }
                            } else {
                                // Default state for un-answered questions
                                buttonClass += " bg-transparent border-gray-700 hover:border-white text-white";
                            }
                            return (
                                <button key={index} onClick={() => handleAnswerSelect(index)} disabled={!!answerForThisQuestion} className={buttonClass}>
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default QuizPage;