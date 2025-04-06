type MessageStatus = 'Unvalidated' | 'Validated' | 'All';
export type Prediction = 'Spam' | 'Ham';
type MessageLabel = Prediction | 'All';
type SortOrder = Prediction | 'Unordered';

export interface MessageFilters {
  validatedStatus: MessageStatus;
  labelType: MessageLabel;
  sortOrder: SortOrder;
  maxConfidence: number;
}

export interface Message {
  id: string; // Firestore document ID
  sender_number: string;
  raw_message: string;
  prediction: Prediction;
  confidence: number;
  validated: boolean;
}

export interface LastDoc {
  id: string;
  data: Message;
}

export interface ActionMessage {
  message: Message;
  action: 'delete' | 'validate';
  validation?: Prediction;
}

export interface StatsBarProps {
  spam: number;
  ham: number;
  validated: number;
  sessionValidated: number;
}
