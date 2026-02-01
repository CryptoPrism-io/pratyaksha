// Hook for managing Life Blueprint state
import { useState, useCallback, useEffect } from "react";
import type {
  LifeBlueprint,
  VisionCategory,
  GoalCategory,
  Lever,
} from "../lib/lifeBlueprintStorage";
import {
  loadLifeBlueprint,
  saveLifeBlueprint,
  addVisionItem,
  removeVisionItem,
  addLever,
  removeLever,
  addGoal,
  toggleGoalComplete,
  removeGoal,
  hasContent,
  getBlueprintSummary,
} from "../lib/lifeBlueprintStorage";

export function useLifeBlueprint() {
  const [blueprint, setBlueprint] = useState<LifeBlueprint>(() => loadLifeBlueprint());

  // Save to localStorage on changes
  useEffect(() => {
    saveLifeBlueprint(blueprint);
  }, [blueprint]);

  // Vision actions
  const addVision = useCallback((text: string, category: VisionCategory) => {
    setBlueprint(prev => addVisionItem(prev, "vision", text, category));
  }, []);

  const removeVision = useCallback((id: string) => {
    setBlueprint(prev => removeVisionItem(prev, "vision", id));
  }, []);

  // Anti-Vision actions
  const addAntiVision = useCallback((text: string, category: VisionCategory) => {
    setBlueprint(prev => addVisionItem(prev, "antiVision", text, category));
  }, []);

  const removeAntiVision = useCallback((id: string) => {
    setBlueprint(prev => removeVisionItem(prev, "antiVision", id));
  }, []);

  // Lever actions
  const addNewLever = useCallback((name: string, description: string, pushesToward: Lever["pushesToward"]) => {
    setBlueprint(prev => addLever(prev, name, description, pushesToward));
  }, []);

  const removeLeverById = useCallback((id: string) => {
    setBlueprint(prev => removeLever(prev, id));
  }, []);

  // Goal actions
  const addShortTermGoal = useCallback((text: string, category: GoalCategory, targetDate?: string) => {
    setBlueprint(prev => addGoal(prev, "shortTermGoals", text, category, targetDate));
  }, []);

  const addLongTermGoal = useCallback((text: string, category: GoalCategory, targetDate?: string) => {
    setBlueprint(prev => addGoal(prev, "longTermGoals", text, category, targetDate));
  }, []);

  const toggleShortTermGoal = useCallback((id: string) => {
    setBlueprint(prev => toggleGoalComplete(prev, "shortTermGoals", id));
  }, []);

  const toggleLongTermGoal = useCallback((id: string) => {
    setBlueprint(prev => toggleGoalComplete(prev, "longTermGoals", id));
  }, []);

  const removeShortTermGoal = useCallback((id: string) => {
    setBlueprint(prev => removeGoal(prev, "shortTermGoals", id));
  }, []);

  const removeLongTermGoal = useCallback((id: string) => {
    setBlueprint(prev => removeGoal(prev, "longTermGoals", id));
  }, []);

  // Utility
  const isEmpty = !hasContent(blueprint);
  const summary = getBlueprintSummary(blueprint);

  return {
    blueprint,
    isEmpty,
    summary,

    // Vision
    addVision,
    removeVision,

    // Anti-Vision
    addAntiVision,
    removeAntiVision,

    // Levers
    addLever: addNewLever,
    removeLever: removeLeverById,

    // Short-term goals
    addShortTermGoal,
    toggleShortTermGoal,
    removeShortTermGoal,

    // Long-term goals
    addLongTermGoal,
    toggleLongTermGoal,
    removeLongTermGoal,
  };
}
