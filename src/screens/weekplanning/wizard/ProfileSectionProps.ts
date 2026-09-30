import {PlanningProfile} from '../../../api/types/planning';

/** What every section of the wizard edits: the profile, changed as a whole value. */
export interface ProfileSectionProps {
  profile: PlanningProfile;
  onChange: (profile: PlanningProfile) => void;
}
