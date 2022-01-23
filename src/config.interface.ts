export enum SSMDConfigAudioDetection {
  EXPECT_AUDIO,
  SMART_DETECT,
  NO_AUDIO,
}

export interface SSMDConfig {
  outputSpeakTag?: boolean;
  prettyPrint?: boolean;
  headingLevels?: {};
  audio?: {
    detectionStrategy?: SSMDConfigAudioDetection;
    audioExtensions?: string[];
  };
}
