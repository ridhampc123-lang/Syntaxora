"use client";

import React, { useState } from "react";
import { toggleCoursePublishAction } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";

export function CoursePublishButton({
  courseId,
  currentStatus,
}: {
  courseId: string;
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      await toggleCoursePublishAction(courseId, currentStatus);
    } finally {
      setLoading(false);
    }
  }

  const isPublished = currentStatus === "published";

  return (
    <Button
      variant={isPublished ? "outline" : "teal"}
      size="sm"
      isLoading={loading}
      onClick={handleToggle}
    >
      {isPublished ? "Unpublish to Draft" : "Publish to Catalog"}
    </Button>
  );
}
