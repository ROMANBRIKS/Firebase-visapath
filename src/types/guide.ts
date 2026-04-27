
export interface Guide {
  id: string;
  title: string;
  country: string;
  visaType: string;
  shortDescription: string;
  fullContent: string;
  purchasedRoadmap: string; // The "Hidden" technical PDF content
  price: number;
  imageUrl: string;
  category: 'Tourism' | 'Work' | 'Study' | 'Nomad' | 'Business';
  prerequisites: string[];
  tableOfContents: string[];
  countryIds: string[];
  createdAt?: any;
  purchasedAt?: any; // Added for library sorting
}

export interface CartItem extends Guide {
  quantity: number;
}
