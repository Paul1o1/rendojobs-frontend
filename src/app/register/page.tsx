"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.Telegram &&
      window.Telegram.WebApp
    ) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      const user = tg.initDataUnsafe?.user;
      if (user?.id) {
        setTelegramId(user.id.toString());
        setFirstName(user.first_name || "");
        setLastName(user.last_name || "");
      } else {
        setError(
          "Telegram User ID not found. Please open this app from Telegram."
        );
        setTelegramId("mock_telegram_id_12345");
        setMessage("Development Mode: Using mock Telegram ID.");
      }
    } else {
      console.warn(
        "Telegram WebApp object not found. Running in development mode."
      );
      setTelegramId("mock_telegram_id_12345");
      setMessage("Development Mode: Telegram WebApp not found. Using mock ID.");
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
    formData.append("dateOfBirth", dateOfBirth);

    if (cvFile) {
      formData.append("cv", cvFile);
    }

    formData.append("careerQuestions", JSON.stringify(careerQuestions));

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jobseekers/register`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage(response.data.message);
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
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Set Up Your Profile</CardTitle>
          <CardDescription>
            Fill out the form below to get started with your job search.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {telegramId ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvFile">Upload CV (PDF, DOCX)</Label>
                <Input
                  id="cvFile"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
                {cvFile && (
                  <p className="text-sm text-muted-foreground">{cvFile.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  name="yearsOfExperience"
                  value={careerQuestions.yearsOfExperience || ""}
                  onChange={handleCareerQuestionChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredRole">Preferred Job Role</Label>
                <Input
                  id="preferredRole"
                  type="text"
                  name="preferredRole"
                  value={careerQuestions.preferredRole || ""}
                  onChange={handleCareerQuestionChange}
                />
              </div>

              <Button type="submit" className="w-full">
                Register
              </Button>
            </form>
          ) : (
            <div className="flex justify-center items-center h-40">
              <p>Loading profile...</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-center space-y-2">
          {message && <p className="text-sm text-green-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardFooter>
      </Card>
    </div>
  );
}
