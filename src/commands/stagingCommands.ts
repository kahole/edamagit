import { getCurrentMagitRepo } from "../utils/magitUtils";

// repository.apply( hunk.diff ) FOR Å STAGE HUNKS!

// NB! Trenger kanskje headeren til hele diffen for å utføre disse.
//       Den kan hektes på i et eget felt i Hunk-modellen, null stress joggedress!

export function magitStage() {
  let currentRepository = getCurrentMagitRepo();

  if (currentRepository) {

    currentRepository.apply("my cool diff");
  }
}

export function magitStageAll() {
  let currentRepository = getCurrentMagitRepo();

  if (currentRepository) {

    currentRepository.apply("all my cool diffs");
  }
}