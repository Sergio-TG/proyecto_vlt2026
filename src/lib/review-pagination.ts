import { supabase } from "@/lib/supabase"
import {
  APPROVED_REVIEW_SELECT,
  parseApprovedReviewRow,
  REVIEWS_PAGE_SIZE,
  type ApprovedReview,
} from "@/lib/reviews"

export async function fetchApprovedReviewsPage(
  alojamientoId: string,
  pageOffset: number,
): Promise<{ reviews: ApprovedReview[]; totalCount: number }> {
  const { data, error, count } = await supabase
    .from("reviews")
    .select(APPROVED_REVIEW_SELECT, { count: "exact" })
    .eq("alojamiento_id", alojamientoId)
    .eq("aprobada", true)
    .order("created_at", { ascending: false })
    .range(pageOffset, pageOffset + REVIEWS_PAGE_SIZE - 1)

  if (error) {
    throw new Error(error.message)
  }

  return {
    reviews: (data ?? []).map(parseApprovedReviewRow),
    totalCount: count ?? 0,
  }
}
