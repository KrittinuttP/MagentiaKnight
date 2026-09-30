export interface HbdWish {
  id: string;
  from: string;
  message: string;
  image?: string;
  alt?: string;
  /** Optional uploader avatar (defaults on UI if missing) */
  avatar?: string;
  fromUpload?: boolean;
  loadOnDemand?: boolean;
}

/** Birthday wishes page content */
export interface HbdPage {
  title: string;
  titleLocal?: string;
  subtitle: string;
  year?: number;
  occasionLabel?: string;
  closingMessage?: string;
  wishes: HbdWish[];
}
