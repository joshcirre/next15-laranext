"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ValidationErrors = {
  url?: string[];
  title?: string[];
  message?: string;
};

export function BookmarkForm() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Get token from cookie when component mounts
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    };

    setToken(getCookie('apiToken'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      alert("Authentication token not found. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookmarks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          title: title || url, // Use the provided title or default to URL
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (response.status === 422 && data.errors) {
          setErrors(data.errors);
          return;
        } else if (data.message) {
          setErrors({ message: data.message });
          return;
        } else {
          throw new Error('Unknown error occurred');
        }
      }

      // Success case
      setUrl("");
      setTitle("");
      alert("Bookmark created!");
      window.location.reload();
    } catch (error) {
      console.error("Failed to create bookmark:", error);
      setErrors({ message: "Failed to create bookmark. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Add New Bookmark</CardTitle>
        <CardDescription>Enter a URL and title to add to your bookmarks collection</CardDescription>
      </CardHeader>
      <CardContent>
        {errors.message && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
            {errors.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              Website URL
            </label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              disabled={isSubmitting}
              className={errors.url ? "border-red-500" : ""}
            />
            {errors.url && (
              <p className="text-red-500 text-xs mt-1">{errors.url[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Bookmark Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Favorite Website"
              disabled={isSubmitting}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title[0]}</p>
            )}
            <p className="text-xs text-gray-500">
              If left empty, the URL will be used as the title
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !token}
          >
            {isSubmitting ? "Adding..." : "Add Bookmark"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
