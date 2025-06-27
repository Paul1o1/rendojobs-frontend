"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_bot?: boolean;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  onEvent: (eventType: string, callback: (...args: any[]) => void) => void;
  offEvent: (eventType: string, callback: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
}

export default function Register() {
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [careerQuestions, setCareerQuestions] = useState<
    Record<string, string>
  >({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      const user = window.Telegram.WebApp.initDataUnsafe?.user;
      if (user?.id) {
        setTelegramId(user.id.toString());
      } else {
        setError(
          "Telegram User ID not found. Please open this app from Telegram."
        );
      }
    } else {
      setError(
        "Telegram WebApp object not found. Are you in a Telegram Mini App?"
      );
    }
  }, []);

  const handleCareerQuestionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCareerQuestions({ ...careerQuestions, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!telegramId) {
      setError("Telegram ID is missing.");
      return;
    }

    const formData = new FormData();
    formData.append("telegramId", telegramId);
    formData.append("phoneNumber", phoneNumber);
    formData.append("email", email);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("dateOfBirth", dateOfBirth); // Should be in YYYY-MM-DD format for backend Date parsing

    if (cvFile) {
      formData.append("cv", cvFile); // 'cv' is the field name for the file on the backend
    }

    formData.append("careerQuestions", JSON.stringify(careerQuestions));

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobseekers/register`,
        formData, // Send formData directly for file uploads
        {
          headers: {
            "Content-Type": "multipart/form-data", // Important for file uploads
          },
        }
      );
      setMessage(response.data.message);
      // Optionally, redirect to profile page or show success message
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.response) {
        setError(
          err.response.data.message || "An error occurred during registration."
        );
      } else {
        setError("Network error or backend is not reachable.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {!showRegistrationForm ? (
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
              Get Started on Your Career Journey Today!
            </h1>
            <p className="text-gray-600 mb-8">
              Set up your professional profile and unlock new job opportunities.
            </p>
            {telegramId && (
              <button
                onClick={() => setShowRegistrationForm(true)}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Set Up Your Profile
              </button>
            )}
            {!telegramId && !error && (
              <p className="text-gray-600 mt-4">
                Loading Telegram user data...
              </p>
            )}
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Set Up Your Profile Today
            </h1>
            {message && (
              <p className="text-green-500 text-center mb-4">{message}</p>
            )}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            {telegramId && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="dateOfBirth"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="cvFile"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Upload CV (PDF, DOCX)
                  </label>
                  <input
                    type="file"
                    id="cvFile"
                    name="cvFile"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>

                {/* Basic career questions - you can expand this significantly */}
                <div>
                  <label
                    htmlFor="yearsOfExperience"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    id="yearsOfExperience"
                    name="yearsOfExperience"
                    value={careerQuestions.yearsOfExperience || ""}
                    onChange={handleCareerQuestionChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="preferredRole"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Preferred Job Role
                  </label>
                  <input
                    type="text"
                    id="preferredRole"
                    name="preferredRole"
                    value={careerQuestions.preferredRole || ""}
                    onChange={handleCareerQuestionChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Register
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
