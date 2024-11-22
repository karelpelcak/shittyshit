import { useEffect } from 'react';
import type { GenericAbortSignal } from 'axios';
import { useContextSelector } from 'use-context-selector';
import { ResponseStateCategory } from '../store/responseState/types';
import { StoreContext } from '../store/rootReducer';
import { useManualApi } from './useManualApi';
import useSetResponseState from './useSetResponseState';
import { gtmPush } from './utils';

export interface Review {
  sectionId: number;
  fields: QuestionField[];
}

export interface QuestionField {
  questionId: number;
  type: 'RADIO_BUTTON' | 'TEXT';
  text: string;
  options: Option[];
}

export interface Option {
  text: string;
  answerId: number;
}

export interface RatingPayload {
  forms: Form[];
}

export interface Form {
  sectionId: number;
  form: FormFields;
}

export interface FormFields {
  fields: AnswerField[];
}

export interface AnswerField {
  questionId: number;
  text: string;
  answerId?: number | null;
}

interface TicketReviewParams {
  ticketId: number;
  luh?: string;
}

const useTicketReview = ({ ticketId, luh }: TicketReviewParams) => {
  const setState = useSetResponseState(ResponseStateCategory.ticketReview);
  const token = useContextSelector(StoreContext, c => c.state.user.token);

  const [
    { data: authData, loading: authLoading, error: authError },
    fetchReviewAuth,
  ] = useManualApi<{ token: string }>({
    url: `/tickets/authenticate/${luh}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: {},
  });

  const [{ loading, ...reviewForm }, fetchReviewForm] = useManualApi<Review[]>({
    url: `tickets/${ticketId}/rating`,
    method: 'GET',
  });

  const [{ loading: putLoading, error }, putReviewForm] = useManualApi<
  Review[]
  >({
    url: `tickets/${ticketId}/rating`,
    method: 'PUT',
  });

  const sendReview = async (data: RatingPayload, signal?: GenericAbortSignal) => {
    try {
      await putReviewForm({
        data,
        headers: luh
          ? { Authorization: `Bearer ${authData?.token}` }
          : undefined,
        signal,
      });
      gtmPush({ event: 'SENT_REVIEW', SENT_REVIEW: data });
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    if (luh && authData?.token) {
      fetchReviewForm({
        headers: { Authorization: `Bearer ${authData?.token}` },
        signal,
      });
    } else if (!luh && token) {
      fetchReviewForm({ signal });
    }

    return () => {
      abortController.abort();
    };
  }, [authData?.token]);

  useEffect(() => {
    if (!luh) {
      return;
    }
    const abortController = new AbortController();
    const signal = abortController.signal;
    fetchReviewAuth({ signal });
    return () => {
      abortController.abort();
    };
  }, [luh]);

  useEffect(() => {
    setState(
      reviewForm.error?.response?.data?.message ||
      authError?.response?.data?.message ||
      error?.response?.data?.message,
      authLoading || loading || putLoading,
    );
  }, [reviewForm.error, authError, error, loading, authLoading, loading]);

  return {
    reviewForm,
    loading: authLoading || loading || putLoading,
    sendReview,
  };
};

export default useTicketReview;
