import { MealPlanMeals } from '../../types'
import { API_ROUTES, apiFetch } from './config'

export interface GenerateMealPlanParams {
  date: string
  accessToken: string
}

export async function generateMealPlan(
  params: GenerateMealPlanParams,
): Promise<MealPlanMeals> {
  const data = await apiFetch<{ meals: MealPlanMeals }>(
    API_ROUTES.mealsGenerate,
    {
      method: 'POST',
      body: JSON.stringify({ date: params.date }),
    },
    params.accessToken,
  )
  return data.meals
}

export interface AskMealQuestionParams {
  question: string
  accessToken: string
}

export async function askMealQuestion(
  params: AskMealQuestionParams,
): Promise<string> {
  const data = await apiFetch<{ answer: string }>(
    API_ROUTES.mealsAsk,
    {
      method: 'POST',
      body: JSON.stringify({ question: params.question }),
    },
    params.accessToken,
  )
  return data.answer
}
