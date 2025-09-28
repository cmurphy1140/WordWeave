/**
 * WordWeave Micro-Interactions After Effects Prototype Specifications
 * 
 * Detailed specifications for creating After Effects prototypes
 * that can be exported as Lottie animations
 */

// ============================================================================
// PROJECT SETUP SPECIFICATIONS
// ============================================================================

export const afterEffectsProjectSpecs = {
  // Project Settings
  project: {
    name: "WordWeave_MicroInteractions",
    version: "2024",
    frameRate: 60,
    duration: "Variable per animation",
    resolution: "1920x1080",
    colorDepth: "8 bits per channel",
    colorSpace: "sRGB"
  },

  // Composition Settings
  compositions: {
    // Button Interactions
    generateButton: {
      name: "Generate_Button_Interaction",
      width: 400,
      height: 200,
      frameRate: 60,
      duration: 2.0, // seconds
      backgroundColor: "transparent"
    },
    shareButton: {
      name: "Share_Button_Interaction", 
      width: 400,
      height: 200,
      frameRate: 60,
      duration: 1.5,
      backgroundColor: "transparent"
    },
    saveButton: {
      name: "Save_Button_Interaction",
      width: 400,
      height: 200,
      frameRate: 60,
      duration: 1.0,
      backgroundColor: "transparent"
    },
    remixButton: {
      name: "Remix_Button_Interaction",
      width: 400,
      height: 200,
      frameRate: 60,
      duration: 2.0,
      backgroundColor: "transparent"
    },

    // Feedback Animations
    successFeedback: {
      name: "Success_Feedback",
      width: 600,
      height: 300,
      frameRate: 60,
      duration: 3.0,
      backgroundColor: "transparent"
    },
    errorFeedback: {
      name: "Error_Feedback",
      width: 600,
      height: 200,
      frameRate: 60,
      duration: 1.5,
      backgroundColor: "transparent"
    },
    loadingFeedback: {
      name: "Loading_Feedback",
      width: 400,
      height: 100,
      frameRate: 60,
      duration: 4.0,
      backgroundColor: "transparent"
    },
    processingFeedback: {
      name: "Processing_Feedback",
      width: 500,
      height: 300,
      frameRate: 60,
      duration: 5.0,
      backgroundColor: "transparent"
    }
  }
};

// ============================================================================
// GENERATE BUTTON SPECIFICATIONS
// ============================================================================

export const generateButtonSpecs = {
  // Main Button Layer
  button: {
    type: "Shape Layer",
    name: "Generate_Button",
    properties: {
      fill: {
        color: "#2d5a3d",
        opacity: 100
      },
      stroke: {
        color: "#4a7c59",
        width: 2,
        opacity: 100
      },
      transform: {
        position: [200, 100],
        scale: [100, 100],
        rotation: 0,
        opacity: 100
      }
    },
    animations: {
      hover: {
        scale: {
          keyframes: [
            { time: 0, value: [100, 100], easing: "easeOut" },
            { time: 0.2, value: [105, 105], easing: "easeOut" }
          ]
        }
      },
      tap: {
        scale: {
          keyframes: [
            { time: 0, value: [105, 105], easing: "easeOut" },
            { time: 0.1, value: [95, 95], easing: "easeOut" },
            { time: 0.2, value: [100, 100], easing: "easeOut" }
          ]
        }
      }
    }
  },

  // Ripple Effect
  ripple: {
    type: "Shape Layer",
    name: "Ripple_Effect",
    properties: {
      fill: {
        color: "#2d5a3d",
        opacity: 0
      },
      transform: {
        position: [200, 100],
        scale: [0, 0],
        opacity: 0
      }
    },
    animations: {
      trigger: {
        scale: {
          keyframes: [
            { time: 0, value: [0, 0], easing: "easeOut" },
            { time: 0.4, value: [150, 150], easing: "easeOut" },
            { time: 0.8, value: [200, 200], easing: "easeOut" }
          ]
        },
        opacity: {
          keyframes: [
            { time: 0, value: 80, easing: "easeOut" },
            { time: 0.4, value: 40, easing: "easeOut" },
            { time: 0.8, value: 0, easing: "easeOut" }
          ]
        }
      }
    }
  },

  // Floating Words
  floatingWords: {
    words: ["create", "inspire", "dream", "flow"],
    properties: {
      font: "Inter Medium",
      fontSize: 16,
      fill: "#2d5a3d",
      stroke: "none"
    },
    animations: {
      float: {
        position: {
          keyframes: [
            { time: 0, value: [200, 100], easing: "easeOut" },
            { time: 0.6, value: [200, 60], easing: "easeOut" },
            { time: 1.2, value: [200, 40], easing: "easeOut" }
          ]
        },
        opacity: {
          keyframes: [
            { time: 0, value: 0, easing: "easeOut" },
            { time: 0.1, value: 100, easing: "easeOut" },
            { time: 1.1, value: 100, easing: "easeOut" },
            { time: 1.2, value: 0, easing: "easeOut" }
          ]
        },
        scale: {
          keyframes: [
            { time: 0, value: [80, 80], easing: "easeOut" },
            { time: 0.1, value: [100, 100], easing: "easeOut" },
            { time: 1.1, value: [100, 100], easing: "easeOut" },
            { time: 1.2, value: [80, 80], easing: "easeOut" }
          ]
        }
      }
    },
    stagger: 0.1 // seconds between each word
  }
};

// ============================================================================
// SHARE BUTTON SPECIFICATIONS
// ============================================================================

export const shareButtonSpecs = {
  // Main Button Layer
  button: {
    type: "Shape Layer",
    name: "Share_Button",
    properties: {
      fill: {
        color: "#4a7c59",
        opacity: 100
      },
      stroke: {
        color: "#7aa874",
        width: 2,
        opacity: 100
      },
      transform: {
        position: [200, 100],
        scale: [100, 100],
        rotation: 0,
        opacity: 100
      }
    },
    animations: {
      hover: {
        scale: {
          keyframes: [
            { time: 0, value: [100, 100], easing: "easeOut" },
            { time: 0.3, value: [108, 108], easing: "easeOut" }
          ]
        }
      },
      tap: {
        scale: {
          keyframes: [
            { time: 0, value: [108, 108], easing: "easeOut" },
            { time: 0.15, value: [92, 92], easing: "easeOut" },
            { time: 0.3, value: [100, 100], easing: "easeOut" }
          ]
        }
      }
    }
  },

  // Particle System
  particles: {
    count: 6,
    properties: {
      fill: {
        color: "#7aa874",
        opacity: 100
      },
      transform: {
        scale: [0, 0],
        opacity: 0
      }
    },
    animations: {
      explode: {
        position: {
          keyframes: [
            { time: 0, value: [200, 100], easing: "easeOut" },
            { time: 0.6, value: "var(--particle-position)", easing: "easeOut" }
          ]
        },
        scale: {
          keyframes: [
            { time: 0, value: [0, 0], easing: "easeOut" },
            { time: 0.3, value: [100, 100], easing: "easeOut" },
            { time: 0.6, value: [50, 50], easing: "easeOut" }
          ]
        },
        opacity: {
          keyframes: [
            { time: 0, value: 0, easing: "easeOut" },
            { time: 0.1, value: 100, easing: "easeOut" },
            { time: 0.6, value: 0, easing: "easeOut" }
          ]
        }
      }
    },
    positions: [
      [230, 70],   // Top right
      [170, 70],   // Top left
      [230, 130],  // Bottom right
      [170, 130],  // Bottom left
      [200, 60],   // Top center
      [200, 140]   // Bottom center
    ],
    delays: [0, 0.05, 0.1, 0.15, 0.2, 0.25] // seconds
  }
};

// ============================================================================
// SUCCESS FEEDBACK SPECIFICATIONS
// ============================================================================

export const successFeedbackSpecs = {
  // Main Message Layer
  message: {
    type: "Text Layer",
    name: "Success_Message",
    properties: {
      font: "Inter Bold",
      fontSize: 24,
      fill: "#2d5a3d",
      stroke: "none",
      text: "Success!",
      transform: {
        position: [300, 150],
        scale: [100, 100],
        opacity: 0
      }
    },
    animations: {
      entrance: {
        opacity: {
          keyframes: [
            { time: 0, value: 0, easing: "easeOut" },
            { time: 0.2, value: 100, easing: "easeOut" },
            { time: 2.8, value: 100, easing: "easeOut" },
            { time: 3.0, value: 0, easing: "easeOut" }
          ]
        },
        scale: {
          keyframes: [
            { time: 0, value: [0, 0], easing: "easeOut" },
            { time: 0.2, value: [100, 100], easing: "easeOut" },
            { time: 2.8, value: [100, 100], easing: "easeOut" },
            { time: 3.0, value: [80, 80], easing: "easeOut" }
          ]
        }
      }
    }
  },

  // Sparkle System
  sparkles: {
    count: 5,
    properties: {
      fill: {
        color: "#ffd700",
        opacity: 0
      },
      stroke: {
        color: "#ffed4e",
        width: 1,
        opacity: 0
      },
      transform: {
        scale: [0, 0],
        rotation: 0,
        opacity: 0
      }
    },
    animations: {
      cascade: {
        position: {
          keyframes: [
            { time: 0, value: "var(--sparkle-start)", easing: "easeOut" },
            { time: 0.75, value: "var(--sparkle-middle)", easing: "easeOut" },
            { time: 1.5, value: "var(--sparkle-end)", easing: "easeOut" }
          ]
        },
        scale: {
          keyframes: [
            { time: 0, value: [0, 0], easing: "easeOut" },
            { time: 0.5, value: [100, 100], easing: "easeOut" },
            { time: 1.5, value: [0, 0], easing: "easeOut" }
          ]
        },
        rotation: {
          keyframes: [
            { time: 0, value: 0, easing: "linear" },
            { time: 1.5, value: 360, easing: "linear" }
          ]
        },
        opacity: {
          keyframes: [
            { time: 0, value: 0, easing: "easeOut" },
            { time: 0.1, value: 100, easing: "easeOut" },
            { time: 1.4, value: 100, easing: "easeOut" },
            { time: 1.5, value: 0, easing: "easeOut" }
          ]
        }
      }
    },
    positions: [
      { start: [200, 100], middle: [200, 80], end: [200, 60] },
      { start: [300, 120], middle: [300, 100], end: [300, 80] },
      { start: [400, 100], middle: [400, 80], end: [400, 60] },
      { start: [250, 140], middle: [250, 120], end: [250, 100] },
      { start: [350, 140], middle: [350, 120], end: [350, 100] }
    ],
    delays: [0, 0.1, 0.2, 0.3, 0.4] // seconds
  }
};

// ============================================================================
// LOADING FEEDBACK SPECIFICATIONS
// ============================================================================

export const loadingFeedbackSpecs = {
  // Main Message Layer
  message: {
    type: "Text Layer",
    name: "Loading_Message",
    properties: {
      font: "Inter Regular",
      fontSize: 18,
      fill: "#2d5a3d",
      stroke: "none",
      text: "Loading...",
      transform: {
        position: [200, 50],
        scale: [100, 100],
        opacity: 100
      }
    }
  },

  // Typing Cursor
  cursor: {
    type: "Shape Layer",
    name: "Typing_Cursor",
    properties: {
      fill: {
        color: "#2d5a3d",
        opacity: 100
      },
      transform: {
        position: [280, 50],
        scale: [100, 100],
        opacity: 100
      }
    },
    animations: {
      blink: {
        opacity: {
          keyframes: [
            { time: 0, value: 100, easing: "easeInOut" },
            { time: 0.5, value: 0, easing: "easeInOut" },
            { time: 1.0, value: 100, easing: "easeInOut" }
          ],
          loop: "infinity"
        }
      },
      move: {
        position: {
          keyframes: [
            { time: 0, value: [280, 50], easing: "linear" },
            { time: 0.5, value: [290, 50], easing: "linear" },
            { time: 1.0, value: [300, 50], easing: "linear" },
            { time: 1.5, value: [310, 50], easing: "linear" },
            { time: 2.0, value: [320, 50], easing: "linear" }
          ],
          loop: "infinity"
        }
      }
    }
  }
};

// ============================================================================
// PROCESSING FEEDBACK SPECIFICATIONS
// ============================================================================

export const processingFeedbackSpecs = {
  // Main Message Layer
  message: {
    type: "Text Layer",
    name: "Processing_Message",
    properties: {
      font: "Inter Regular",
      fontSize: 18,
      fill: "#2d5a3d",
      stroke: "none",
      text: "Processing...",
      transform: {
        position: [250, 150],
        scale: [100, 100],
        opacity: 100
      }
    }
  },

  // Inkblot System
  inkblots: {
    count: 3,
    properties: {
      fill: {
        color: "#2d5a3d",
        opacity: 0
      },
      transform: {
        scale: [0, 0],
        opacity: 0
      }
    },
    animations: {
      morph: {
        scale: {
          keyframes: [
            { time: 0, value: [0, 0], easing: "easeInOut" },
            { time: 0.75, value: [100, 100], easing: "easeInOut" },
            { time: 1.5, value: [80, 80], easing: "easeInOut" },
            { time: 2.25, value: [120, 120], easing: "easeInOut" },
            { time: 3.0, value: [100, 100], easing: "easeInOut" },
            { time: 3.75, value: [0, 0], easing: "easeInOut" }
          ],
          loop: "infinity"
        },
        opacity: {
          keyframes: [
            { time: 0, value: 0, easing: "easeInOut" },
            { time: 0.75, value: 60, easing: "easeInOut" },
            { time: 1.5, value: 80, easing: "easeInOut" },
            { time: 2.25, value: 60, easing: "easeInOut" },
            { time: 3.0, value: 0, easing: "easeInOut" }
          ],
          loop: "infinity"
        }
      }
    },
    positions: [
      [200, 100],
      [300, 200],
      [400, 150]
    ],
    delays: [0, 1, 2] // seconds
  }
};

// ============================================================================
// LOTTIE EXPORT SPECIFICATIONS
// ============================================================================

export const lottieExportSpecs = {
  // General Settings
  settings: {
    format: "JSON",
    version: "5.7.4",
    frameRate: 60,
    inPoint: 0,
    outPoint: "auto",
    width: "auto",
    height: "auto",
    backgroundColor: "transparent"
  },

  // Export Options
  options: {
    includeAssets: true,
    includeExpressions: true,
    includeHiddenLayers: false,
    includeUnusedAssets: false,
    optimizeForWeb: true,
    compress: true
  },

  // File Naming Convention
  naming: {
    prefix: "wordweave_",
    suffix: "_animation",
    format: "snake_case"
  },

  // Output Files
  outputFiles: [
    "wordweave_generate_button_animation.json",
    "wordweave_share_button_animation.json", 
    "wordweave_save_button_animation.json",
    "wordweave_remix_button_animation.json",
    "wordweave_success_feedback_animation.json",
    "wordweave_error_feedback_animation.json",
    "wordweave_loading_feedback_animation.json",
    "wordweave_processing_feedback_animation.json"
  ]
};

// ============================================================================
// IMPLEMENTATION NOTES
// ============================================================================

export const implementationNotes = {
  // After Effects Setup
  setup: [
    "Create new project with 60fps frame rate",
    "Set color space to sRGB for web compatibility",
    "Use shape layers for scalable graphics",
    "Apply easing curves for natural motion",
    "Use expressions for dynamic animations"
  ],

  // Animation Principles
  principles: [
    "Ease in/out for natural motion",
    "Stagger timing for visual interest",
    "Consistent timing across similar elements",
    "Subtle effects that enhance, not distract",
    "Performance-conscious animation duration"
  ],

  // Export Considerations
  export: [
    "Optimize for web delivery",
    "Use Bodymovin plugin for Lottie export",
    "Test animations in browser",
    "Provide fallback CSS animations",
    "Consider reduced motion preferences"
  ],

  // Integration Notes
  integration: [
    "Use Lottie Web library for React integration",
    "Provide CSS fallbacks for unsupported browsers",
    "Implement theme-aware color changes",
    "Add accessibility considerations",
    "Test performance on mobile devices"
  ]
};

export default {
  afterEffectsProjectSpecs,
  generateButtonSpecs,
  shareButtonSpecs,
  successFeedbackSpecs,
  loadingFeedbackSpecs,
  processingFeedbackSpecs,
  lottieExportSpecs,
  implementationNotes
};
