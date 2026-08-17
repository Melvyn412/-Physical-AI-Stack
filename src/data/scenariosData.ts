import { ObjectiveScenario } from '../types';

export const PRESET_SCENARIOS: ObjectiveScenario[] = [
  {
    id: 'search-and-rescue',
    title: 'Hazardous Disaster Search & Rescue',
    category: 'Emergency Operations',
    icon: 'ShieldAlert',
    environment: 'Collapsed Structural Debris with Smoke & Dust',
    embodiment: 'Quadruped Robot with Bimanual Manipulator Arm & Thermal Array',
    difficulty: 'Extreme Environment',
    targetGoal: 'Locate thermal human signature behind obstacle, calculate safe rubble lifting path without triggering secondary collapse, deploy medical kit.',
    description: 'The robot navigates zero-visibility dust using solid-state LiDAR, thermal imaging, and acoustic micro-sensors. It uses its generative world model to simulate rubble structural physics before applying force, ensuring stable debris removal.',
    defaultMultimodal: {
      sensors: ['Thermal IR Array', '3D Flash LiDAR', 'Acoustic Sound Array', 'Stereo Depth Cameras', 'Foot Contact Tactile Pads'],
      fusionRateHz: 120,
      noiseMitigation: 'Multispectral point cloud filtering & particulate light scattering compensation',
      dataVolumeMbps: 680
    },
    defaultWorldModel: {
      gridResolutionCm: 1.0,
      predictionHorizonMs: 2500,
      physicsEngine: 'Structural Friction & Debris Gravity Rollout',
      confidenceScore: 97.8
    },
    defaultReasoning: {
      strategy: 'Tree-of-Thought Hazard Pruning',
      cotSteps: [
        '1. Detect 37.2°C thermal heat anomaly through 12cm concrete gap.',
        '2. Model center of gravity for top 45kg concrete slab.',
        '3. Verify lifting vector force does not disturb lower support pillar.',
        '4. Formulate step-by-step extraction sequence with human supervisor override standby.'
      ],
      hazardLevel: 'HIGH'
    },
    defaultAgents: {
      activeAgents: ['ThermalPerceptionAgent', 'DebrisPhysicsSim', 'HazardReasoningAgent', 'ForceActuatorAgent'],
      subGoalDAG: 'ThermalLocate -> RubbleMeshBuild -> CollapseSimulate -> ArmGripExecute -> RescueKitDeliver',
      consensusScore: 0.985
    },
    defaultRobotics: {
      kinematics: '7-DOF Compliant Arm + Quadruped Stance Stability',
      controlFrequencyHz: 1000,
      targetTorqueNm: [65.4, 112.0, 88.5, 42.1, 18.3, 9.2, 4.1],
      gripForceN: 48.0
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Multispectral Thermal & LiDAR Scan',
        description: 'Fusing thermal array data with 3D LiDAR point clouds to detect target heat signature through dense smoke.',
        activeLayer: 'multimodality',
        status: 'NORMAL',
        confidence: 99.4
      },
      {
        stepNumber: 2,
        title: 'Generative Debris Physics Rollout',
        description: 'Simulating 2.5s trajectory of concrete slab movement. Calculating friction and gravitational load transfer.',
        activeLayer: 'world_models',
        status: 'NORMAL',
        confidence: 97.2
      },
      {
        stepNumber: 3,
        title: 'Safety Hazard & Fallback Reasoning',
        description: 'Evaluating structural collapse probability. Confirming lift force vector remains within 15% safety threshold.',
        activeLayer: 'reasoning',
        status: 'NORMAL',
        confidence: 98.6
      },
      {
        stepNumber: 4,
        title: 'Multi-Agent Sub-Goal Orchestration',
        description: 'DebrisPhysicsSim confirms stability. HazardReasoningAgent delegates grip execution to ForceActuatorAgent.',
        activeLayer: 'agents',
        status: 'NORMAL',
        confidence: 99.1
      },
      {
        stepNumber: 5,
        title: '1000Hz Compliant Joint Actuation',
        description: 'Executing 7-DOF arm trajectory with active impedance feedback to lift slab and position emergency medical kit.',
        activeLayer: 'robotics',
        status: 'NORMAL',
        confidence: 99.8
      }
    ]
  },
  {
    id: 'surgical-robotics',
    title: 'Robot-Assisted Micro-Surgical Suturing',
    category: 'Healthcare & Medicine',
    icon: 'Stethoscope',
    environment: 'Sterile Operating Theater with Deformable Soft Tissue',
    embodiment: '4-Arm Micro-Wrist Surgical Robot with Sub-10-Micron Haptic Feedback',
    difficulty: 'Zero-Margin Safety',
    targetGoal: 'Thread 10-0 nylon suture needle through 1.2mm coronary vessel wall while dynamically compensating for patient heartbeat and respiration.',
    description: 'Combines sub-10-micron optical coherence tomography (OCT) and stereo micro-endoscopes with real-time deformable tissue world models. The 4-arm surgical robot filters physiological tremors and executes closed-loop suture tension control.',
    defaultMultimodal: {
      sensors: ['Stereo 4K 3D Micro-Endoscope', 'Optical Coherence Tomography (OCT)', 'Sub-Micron Haptic Force Array', 'EHR Patient Vitals Feed'],
      fusionRateHz: 240,
      noiseMitigation: 'Blood specularity reflection filter & sub-pixel motion stabilization',
      dataVolumeMbps: 950
    },
    defaultWorldModel: {
      gridResolutionCm: 0.01,
      predictionHorizonMs: 1000,
      physicsEngine: 'Deformable Organ Tissue & Vascular Fluid Mechanics',
      confidenceScore: 99.6
    },
    defaultReasoning: {
      strategy: 'Zero-Incision Motion Filter & Tremor Suppression',
      cotSteps: [
        '1. Map 3D lumen entry point using 240Hz micro-OCT scan.',
        '2. Predict cardiac contraction phase 300ms ahead using ECG synchronization.',
        '3. Calculate suture tension vector to prevent vessel wall tearing.',
        '4. Execute micro-rotation with sub-milligram force sensing.'
      ],
      hazardLevel: 'CRITICAL'
    },
    defaultAgents: {
      activeAgents: ['SurgicalVisionAgent', 'OrganMotionPredictor', 'TissueSafetyMonitor', 'MicroHapticDriver'],
      subGoalDAG: 'TrackVessel -> PredictBeat -> AlignNeedle -> PierceWall -> KnotTensionCheck',
      consensusScore: 0.998
    },
    defaultRobotics: {
      kinematics: '4-Arm Micro-Wrist Manipulators (7-DOF each)',
      controlFrequencyHz: 2000,
      targetTorqueNm: [0.8, 1.2, 0.9, 0.4, 0.2, 0.1, 0.05],
      gripForceN: 0.8
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Micro-OCT & 4K Stereo Endoscopic Scanning',
        description: 'Fusing optical coherence tomography and stereo micro-endoscope imagery to map 1.2mm vascular walls at 240Hz.',
        activeLayer: 'multimodality',
        status: 'NORMAL',
        confidence: 99.8
      },
      {
        stepNumber: 2,
        title: 'Deformable Cardiac Dynamics Rollout',
        description: 'Generative world model simulates 1.0s cardiac contraction cycle and vessel wall elasticity deformation.',
        activeLayer: 'world_models',
        status: 'NORMAL',
        confidence: 99.4
      },
      {
        stepNumber: 3,
        title: 'Tremor-Free Micro-Trajectory Reasoning',
        description: 'Computing needle trajectory that cancels surgeon physiological hand tremors and syncs with heartbeat.',
        activeLayer: 'reasoning',
        status: 'NORMAL',
        confidence: 99.7
      },
      {
        stepNumber: 4,
        title: 'Multi-Arm Surgical Agent Orchestration',
        description: 'OrganMotionPredictor signals zero-phase beat window. MicroHapticDriver receives needle rotation command.',
        activeLayer: 'agents',
        status: 'NORMAL',
        confidence: 99.9
      },
      {
        stepNumber: 5,
        title: '2000Hz Sub-Micron Suture Execution',
        description: 'Piercing vessel wall with sub-milligram haptic force feedback and tying micro-knot at 0.8N target tension.',
        activeLayer: 'robotics',
        status: 'NORMAL',
        confidence: 99.9
      }
    ]
  },
  {
    id: 'patient-caregiver',
    title: 'Autonomous In-Home Patient Mobility Assist',
    category: 'Healthcare & Caregiving',
    icon: 'Heart',
    environment: 'Unstructured In-Home Living Space with Soft Furnishings',
    embodiment: 'Dual-Arm Mobile Service Humanoid with Air-Muscle Compliance',
    difficulty: 'High Precision',
    targetGoal: 'Assist elderly patient with mobility transfer from bed to wheelchair, continuously monitoring posture, skin friction, and equilibrium.',
    description: 'Operates in close contact with human subjects. The robot uses 3D depth cameras and 200-zone tactile body pads to estimate patient center-of-mass, executing ultra-soft pneumatic air-muscle lifting that guarantees zero bruising or sudden acceleration.',
    defaultMultimodal: {
      sensors: ['3D Skeleton Pose Depth Array', '200-Zone Tactile Air-Sleeve Sensors', 'Acoustic Pain & Speech Monitor', 'IMU Body Balance Grid'],
      fusionRateHz: 120,
      noiseMitigation: 'Fabric occlusion filter & soft contact noise smoothing',
      dataVolumeMbps: 540
    },
    defaultWorldModel: {
      gridResolutionCm: 0.5,
      predictionHorizonMs: 2000,
      physicsEngine: 'Biomechanics & Soft Human Body Gravity Model',
      confidenceScore: 98.9
    },
    defaultReasoning: {
      strategy: 'Continuous Human Comfort & Equilibrium Optimizer',
      cotSteps: [
        '1. Track patient 3D spine and joint pressure points.',
        '2. Compute comfortable posture transfer curve.',
        '3. Evaluate grip softness against skin fragility threshold.',
        '4. Execute gradual lift with instant pneumatic relief valve standby.'
      ],
      hazardLevel: 'MEDIUM'
    },
    defaultAgents: {
      activeAgents: ['PoseTrackerAgent', 'BiomechanicsSim', 'PatientComfortMonitor', 'AirMuscleActuator'],
      subGoalDAG: 'TrackPose -> AssessEquilibrium -> WrapPneumaticSleeve -> LiftSmoothly -> SecureInChair',
      consensusScore: 0.993
    },
    defaultRobotics: {
      kinematics: 'Dual 7-DOF Pneumatic Compliant Arms',
      controlFrequencyHz: 1000,
      targetTorqueNm: [28.4, 45.1, 32.0, 18.5, 9.2, 4.1, 2.0],
      gripForceN: 22.0
    },
    steps: [
      {
        stepNumber: 1,
        title: '3D Skeleton & Tactile Contact Scan',
        description: 'Tracking patient spine alignment and limb position while 200-zone tactile sleeves calibrate contact area.',
        activeLayer: 'multimodality',
        status: 'NORMAL',
        confidence: 99.3
      },
      {
        stepNumber: 2,
        title: 'Human Biomechanics & Center-of-Mass Rollout',
        description: 'Simulating body weight shift and limb stress during transfer to eliminate fall or joint strain risk.',
        activeLayer: 'world_models',
        status: 'NORMAL',
        confidence: 98.7
      },
      {
        stepNumber: 3,
        title: 'Patient Safety & Pain Monitoring Reasoning',
        description: 'Verifying lifting force distribution stays below 25 kPa pressure threshold to protect delicate skin.',
        activeLayer: 'reasoning',
        status: 'NORMAL',
        confidence: 99.1
      },
      {
        stepNumber: 4,
        title: 'Agent Consensus & Voice Comfort Check',
        description: 'PatientComfortMonitor verifies audio confirmation and stability before signaling AirMuscleActuator.',
        activeLayer: 'agents',
        status: 'NORMAL',
        confidence: 99.5
      },
      {
        stepNumber: 5,
        title: 'Soft Pneumatic Closed-Loop Lift',
        description: 'Gently lifting patient into ergonomic wheelchair with continuous 1000Hz air-muscle compliance.',
        activeLayer: 'robotics',
        status: 'NORMAL',
        confidence: 99.8
      }
    ]
  },
  {
    id: 'smart-agriculture',
    title: 'Precision Vineyard Pruning & Fruit Harvest',
    category: 'Precision Agriculture',
    icon: 'Sprout',
    environment: 'Outdoors Agricultural Vineyard under Wind & Direct Sunlight',
    embodiment: 'Tracked All-Terrain Field Rover with Soft Pneumatic Fruit Grippers',
    difficulty: 'Extreme Environment',
    targetGoal: 'Identify ripe grape clusters inside dense leaf canopy, calculate stem snip location, and harvest without damaging fruit or adjacent vines.',
    description: 'Fuses multispectral NIR vision with outdoor wind dynamics modeling. The robot uses soft silicone grippers to cradle delicate fruit while precise shears clip stems at 120Hz.',
    defaultMultimodal: {
      sensors: ['Multispectral NIR Vine Camera', 'Stereo Depth Sensor', 'Wind Anemometer', 'Finger-Integrated Soft Pressure Grid'],
      fusionRateHz: 120,
      noiseMitigation: 'Direct sunlight glare cancellation & leaf occlusion unravelling',
      dataVolumeMbps: 490
    },
    defaultWorldModel: {
      gridResolutionCm: 0.2,
      predictionHorizonMs: 1800,
      physicsEngine: 'Plant Stem Elasticity & Foliage Wind Dynamics',
      confidenceScore: 97.9
    },
    defaultReasoning: {
      strategy: 'Canopy Penetration & Non-Destructive Snip Engine',
      cotSteps: [
        '1. Segment sugar-ripe grape clusters behind leaf shadow using NIR spectroscopy.',
        '2. Predict vine branch sway under 12km/h wind gusts.',
        '3. Plan collision-free cutter approach through dense foliage.',
        '4. Execute dual-hand cradle-and-snip sequence.'
      ],
      hazardLevel: 'LOW'
    },
    defaultAgents: {
      activeAgents: ['CropVisionAgent', 'WindDynamicsSim', 'FoliagePathPlanner', 'SoftGraspActuator'],
      subGoalDAG: 'SegmentRipe -> PredictWindSway -> PartFoliage -> CradleCluster -> SnipStem',
      consensusScore: 0.989
    },
    defaultRobotics: {
      kinematics: 'Dual 6-DOF Soft-Actuated Arms',
      controlFrequencyHz: 1000,
      targetTorqueNm: [12.1, 24.5, 16.2, 8.1, 3.4, 1.2],
      gripForceN: 8.5
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Multispectral NIR Foliage Penetration',
        description: 'Analyzing sugar content (Brix index) and 3D fruit cluster location through dense leaf shadows.',
        activeLayer: 'multimodality',
        status: 'NORMAL',
        confidence: 98.9
      },
      {
        stepNumber: 2,
        title: 'Vine Sway Wind Prediction Rollout',
        description: 'Generative world model forecasts vine stem motion induced by local wind gusts across 1.8s window.',
        activeLayer: 'world_models',
        status: 'NORMAL',
        confidence: 97.4
      },
      {
        stepNumber: 3,
        title: 'Non-Destructive Cutter Route Planning',
        description: 'Calculating leaf parting trajectory to access stem without damaging fruit skin or adjacent yield.',
        activeLayer: 'reasoning',
        status: 'NORMAL',
        confidence: 98.5
      },
      {
        stepNumber: 4,
        title: 'Agent Foliage Dispatch',
        description: 'FoliagePathPlanner separates leaves while SoftGraspActuator aligns delicate silicone fingers.',
        activeLayer: 'agents',
        status: 'NORMAL',
        confidence: 99.1
      },
      {
        stepNumber: 5,
        title: 'Soft-Cradle & Precision Stem Snip',
        description: 'Cradling grape cluster with soft 8.5N pressure while high-speed shears cleanly sever stem.',
        activeLayer: 'robotics',
        status: 'NORMAL',
        confidence: 99.6
      }
    ]
  },
  {
    id: 'subsea-pipeline',
    title: 'Subsea Offshore Pipeline Valve Servicing',
    category: 'Subsea & Offshore Engineering',
    icon: 'Anchor',
    environment: '3,000m Ocean Floor with 300 Bar Hydrostatic Pressure & Currents',
    embodiment: 'Subsea Autonomous Underwater Vehicle (AUV) with Heavy Hydraulic Grippers',
    difficulty: 'Zero-Margin Safety',
    targetGoal: 'Inspect subsea oil manifold valve for micro-leaks, clear bio-fouling incrustation with high-pressure jet, and actuate frozen valve.',
    description: 'Operates under 300 atmospheres of hydrostatic pressure in murky ocean currents. Fuses 3D acoustic sonar with optical enhancement to build spatial world models, applying up to 350Nm of controlled hydraulic torque.',
    defaultMultimodal: {
      sensors: ['3D Multibeam Acoustic Sonar', 'Turbidity-Filtered Optical Camera', 'Hydrostatic Pressure Transducer', 'Hydraulic Force Sensors'],
      fusionRateHz: 100,
      noiseMitigation: 'Turbid silt backscatter suppression & acoustic echo cancellation',
      dataVolumeMbps: 410
    },
    defaultWorldModel: {
      gridResolutionCm: 1.0,
      predictionHorizonMs: 3000,
      physicsEngine: 'Hydrodynamic Drag & High-Pressure Hydraulic Mechanics',
      confidenceScore: 97.1
    },
    defaultReasoning: {
      strategy: 'Deep-Ocean Hydrodynamic Stability & Torque Verifier',
      cotSteps: [
        '1. Reconstruct 3D valve geometry through acoustic sonar reflectivity in silt.',
        '2. Simulate ROV counter-thrust required against 2.5 knot crosscurrent.',
        '3. Verify bolt shear limits before applying 350Nm breakaway torque.',
        '4. Engage heavy hydraulic clamp and turn valve.'
      ],
      hazardLevel: 'HIGH'
    },
    defaultAgents: {
      activeAgents: ['SonarPerceptionAgent', 'HydrodynamicsSim', 'SubseaMissionPlanner', 'HydraulicTorqueDriver'],
      subGoalDAG: 'SonarScan -> LockSubseaStation -> JetBiofouling -> ClampValve -> Apply350NmBreakaway',
      consensusScore: 0.987
    },
    defaultRobotics: {
      kinematics: 'Dual Heavy 6-DOF Hydraulic Manipulators + ROV Thruster Matrix',
      controlFrequencyHz: 500,
      targetTorqueNm: [350.0, 280.0, 190.0, 110.0, 65.0, 30.0],
      gripForceN: 450.0
    },
    steps: [
      {
        stepNumber: 1,
        title: '3D Acoustic Sonar & Turbidity Filtering',
        description: 'Penetrating murky 3,000m seabed silt with multibeam sonar to locate 3D manifold geometry.',
        activeLayer: 'multimodality',
        status: 'NORMAL',
        confidence: 98.2
      },
      {
        stepNumber: 2,
        title: 'Hydrodynamic Current & Thruster Sim',
        description: 'Simulating ROV stability against 2.5 knot crosscurrent and 300 bar water pressure.',
        activeLayer: 'world_models',
        status: 'NORMAL',
        confidence: 96.9
      },
      {
        stepNumber: 3,
        title: 'Hydraulic Breakaway Torque Reasoning',
        description: 'Calculating maximum safe torque limit (350Nm) to unfreeze stuck valve without shearing stem.',
        activeLayer: 'reasoning',
        status: 'NORMAL',
        confidence: 98.1
      },
      {
        stepNumber: 4,
        title: 'Subsea Agent Thruster-Arm Coordination',
        description: 'HydrodynamicsSim counter-fires ROV thrusters as HydraulicTorqueDriver locks manipulator onto valve handwheel.',
        activeLayer: 'agents',
        status: 'NORMAL',
        confidence: 98.8
      },
      {
        stepNumber: 5,
        title: '500Hz Closed-Loop Hydraulic Actuation',
        description: 'Applying 350Nm breakaway torque with real-time pressure regulation to rotate valve into open position.',
        activeLayer: 'robotics',
        status: 'NORMAL',
        confidence: 99.4
      }
    ]
  },
  {
    id: 'micro-assembly',
    title: 'High-Precision Micro-Electronics Assembly',
    category: 'Advanced Manufacturing',
    icon: 'Cpu',
    environment: 'Cleanroom Assembly Line with Dynamic Component Infeed',
    embodiment: 'Dual-Arm High-Precision Manipulator with Tactile Fingertips',
    difficulty: 'High Precision',
    targetGoal: 'Pick micro-flexible circuit ribbon, align to 50-micron tolerance under variable lighting, and apply uniform 2.4N bonding pressure.',
    description: 'Requires sub-millimeter visual precision and soft tactile force sensing. The system continuously simulates substrate elasticity to avoid tearing delicate micro-circuitry while applying microscopic adhesive pressure.',
    defaultMultimodal: {
      sensors: ['Microscopic High-Speed Cameras', 'FingerSense 100-Zone Tactile Grid', 'Laser Interferometer Depth Gauge'],
      fusionRateHz: 240,
      noiseMitigation: 'Micro-vibration dampening & specularity filter',
      dataVolumeMbps: 820
    },
    defaultWorldModel: {
      gridResolutionCm: 0.05,
      predictionHorizonMs: 1000,
      physicsEngine: 'Flexible Ribbon Elasticity & Micro-Contact Mechanics',
      confidenceScore: 99.2
    },
    defaultReasoning: {
      strategy: 'Sub-Millimeter Constraint Satisfier',
      cotSteps: [
        '1. Track component position at 240FPS micro-vision.',
        '2. Predict flexural bending curve of circuit ribbon under 2.4N grip.',
        '3. Calculate zero-shearing insertion trajectory.',
        '4. Execute closed-loop force compliance.'
      ],
      hazardLevel: 'LOW'
    },
    defaultAgents: {
      activeAgents: ['MicroVisionAgent', 'ElasticitySimAgent', 'PrecisionPlanner', 'GripController'],
      subGoalDAG: 'TrackRibbon -> SimFlexure -> AlignPins -> PressUniform -> VerifyContact',
      consensusScore: 0.996
    },
    defaultRobotics: {
      kinematics: 'Dual 6-DOF Micro-Actuated Arms',
      controlFrequencyHz: 2000,
      targetTorqueNm: [3.2, 5.1, 4.0, 1.8, 0.9, 0.4],
      gripForceN: 2.4
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Micro-Optical & Tactile Sensing',
        description: 'Capturing 240Hz microscopic video and 100-zone tactile pressure array to register circuit ribbon orientation.',
        activeLayer: 'multimodality',
        status: 'NORMAL',
        confidence: 99.8
      },
      {
        stepNumber: 2,
        title: 'Substrate Elasticity Prediction',
        description: 'Generative world model simulates ribbon flexure under grip load to prevent micro-fractures.',
        activeLayer: 'world_models',
        status: 'NORMAL',
        confidence: 99.1
      },
      {
        stepNumber: 3,
        title: 'Zero-Shearing Trajectory Reasoning',
        description: 'Computing alignment path to match 50-micron connector pin spacing while accounting for thermal expansion.',
        activeLayer: 'reasoning',
        status: 'NORMAL',
        confidence: 99.4
      },
      {
        stepNumber: 4,
        title: 'Agent Precision Delegation',
        description: 'PrecisionPlanner synchronizes micro-actuator steps while GripController monitors 100-zone pressure grid.',
        activeLayer: 'agents',
        status: 'NORMAL',
        confidence: 99.7
      },
      {
        stepNumber: 5,
        title: '2000Hz Force-Controlled Insertion',
        description: 'Applying uniform 2.4N force across pin contacts with zero micro-slippage.',
        activeLayer: 'robotics',
        status: 'NORMAL',
        confidence: 99.9
      }
    ]
  },
  {
    id: 'warehouse-sorting',
    title: 'Dynamic High-Speed Warehouse Sorting',
    category: 'Autonomous Logistics',
    icon: 'Package',
    environment: 'Fulfillment Center Conveyor with Unpredictable Items',
    embodiment: 'Mobile Humanoid Robot with Suction + Adaptive Finger Grippers',
    difficulty: 'Standard',
    targetGoal: 'Sort 1,200 heterogeneous items/hour off fast moving conveyor belt, handling deformable plastic bags and fragile boxes.',
    description: 'Deconstructs messy pile inputs into distinct package meshes. World model predicts object tumble trajectories on moving belts, enabling perfect interception timing.',
    defaultMultimodal: {
      sensors: ['Overhead RGB-D Camera Array', 'Wrist 3D Time-of-Flight Sensor', 'Suction Pressure Feedback'],
      fusionRateHz: 120,
      noiseMitigation: 'Dynamic motion blur correction & glare suppression',
      dataVolumeMbps: 510
    },
    defaultWorldModel: {
      gridResolutionCm: 0.5,
      predictionHorizonMs: 1500,
      physicsEngine: 'Conveyor Dynamics & Package Tumble Rollout',
      confidenceScore: 98.6
    },
    defaultReasoning: {
      strategy: 'High-Throughput Opportunistic Grasping',
      cotSteps: [
        '1. Segment package boundary in fast-moving stream.',
        '2. Classify object rigid vs deformable material.',
        '3. Estimate center of mass & best suction/finger grasp location.',
        '4. Calculate intercept trajectory at 1.8m/s conveyor speed.'
      ],
      hazardLevel: 'LOW'
    },
    defaultAgents: {
      activeAgents: ['ItemSegmentationAgent', 'ConveyorSimAgent', 'GraspSelector', 'ArmDriver'],
      subGoalDAG: 'SegmentStream -> PredictIntercept -> ChooseGrasp -> ActuateIntercept -> PlaceInBin',
      consensusScore: 0.992
    },
    defaultRobotics: {
      kinematics: 'Humanoid Torso + Dual 7-DOF Arms',
      controlFrequencyHz: 1000,
      targetTorqueNm: [18.2, 34.5, 22.1, 12.0, 6.4, 3.2, 1.1],
      gripForceN: 18.0
    },
    steps: [
      {
        stepNumber: 1,
        title: 'High-Speed RGB-D Item Segmentation',
        description: 'Segmenting overlapping boxes and deformable polybags at 120Hz overhead camera stream.',
        activeLayer: 'multimodality',
        status: 'NORMAL',
        confidence: 99.2
      },
      {
        stepNumber: 2,
        title: 'Conveyor Tumble Motion Forecasting',
        description: 'Simulating item slide and rotation dynamics at 1.8m/s conveyor speed to compute intercept window.',
        activeLayer: 'world_models',
        status: 'NORMAL',
        confidence: 98.4
      },
      {
        stepNumber: 3,
        title: 'Grasp Strategy Selection Reasoning',
        description: 'Choosing hybrid suction + finger pinch grasp for delicate polybag vs suction cup for rigid cardboard box.',
        activeLayer: 'reasoning',
        status: 'NORMAL',
        confidence: 98.9
      },
      {
        stepNumber: 4,
        title: 'Agent Execution Dispatch',
        description: 'GraspSelector issues exact motor path to ArmDriver with instant fallback if item shifts on belt.',
        activeLayer: 'agents',
        status: 'NORMAL',
        confidence: 99.3
      },
      {
        stepNumber: 5,
        title: 'Smooth 1000Hz Arm Interception',
        description: 'Executing smooth joint trajectory to match conveyor velocity, pick item, and deposit in target sorting bin.',
        activeLayer: 'robotics',
        status: 'NORMAL',
        confidence: 99.6
      }
    ]
  },
  {
    id: 'extraterrestrial-rover',
    title: 'Extraterrestrial Rover Geological Sampling',
    category: 'Space Exploration',
    icon: 'Rocket',
    environment: 'Martian Regolith with Variable Slip & 22-Minute Signal Lag',
    embodiment: 'Autonomous Rover with Heavy Rock Coring Drill & Bimanual Manipulator',
    difficulty: 'Zero-Margin Safety',
    targetGoal: 'Identify scientifically valuable rock core target, navigate steep regolith slope without wheel entrapment, and drill sample.',
    description: 'With a 22-minute round-trip light time, Earth human teleoperation is impossible. The rover relies entirely on onboard world models to simulate soil shear strength, wheel slip vectors, and drill torque dynamics.',
    defaultMultimodal: {
      sensors: ['Dual Navcam Stereo Sensors', 'Hazcam Obstacle Point Cloud', 'Wheel Torque Slip Sensors', 'Spectrometer'],
      fusionRateHz: 60,
      noiseMitigation: 'Solar glare compensation & dust accumulation filtering',
      dataVolumeMbps: 320
    },
    defaultWorldModel: {
      gridResolutionCm: 2.0,
      predictionHorizonMs: 5000,
      physicsEngine: 'Granular Regolith Mechanics & Slope Sinkage Rollout',
      confidenceScore: 96.5
    },
    defaultReasoning: {
      strategy: 'Zero-Margin Autonomous Survival Engine',
      cotSteps: [
        '1. Inspect rock formation using onboard multispectral analysis.',
        '2. Predict wheel sinkage on 22° regolith slope.',
        '3. Verify rover tilt angle stays below critical 30° tip threshold.',
        '4. Execute autonomous coring drill with dynamic torque feedback.'
      ],
      hazardLevel: 'HIGH'
    },
    defaultAgents: {
      activeAgents: ['GeologySurveyor', 'TerramechanicsSim', 'AutonavPlanner', 'DrillActuator'],
      subGoalDAG: 'SurveyRock -> SimSlopeSlip -> NavigateToSite -> AnchorRover -> DrillCoreSample',
      consensusScore: 0.988
    },
    defaultRobotics: {
      kinematics: 'Rocker-Bogie Suspension + 5-DOF Coring Arm',
      controlFrequencyHz: 500,
      targetTorqueNm: [140.0, 185.2, 110.4, 62.0, 31.5],
      gripForceN: 120.0
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Stereo Navcam & Spectrometer Terrain Scan',
        description: 'Mapping 3D regolith contours and analyzing rock chemical composition without ground control intervention.',
        activeLayer: 'multimodality',
        status: 'NORMAL',
        confidence: 98.5
      },
      {
        stepNumber: 2,
        title: 'Regolith Terramechanics Simulation',
        description: 'Simulating soil shear strain and wheel sinkage on 22° Martian slope across 5.0s motion horizon.',
        activeLayer: 'world_models',
        status: 'NORMAL',
        confidence: 96.8
      },
      {
        stepNumber: 3,
        title: 'Tip Hazard & Safe Trajectory Reasoning',
        description: 'Computing optimal wheel approach angles to keep gravity vector centered well within wheel footprint.',
        activeLayer: 'reasoning',
        status: 'NORMAL',
        confidence: 98.1
      },
      {
        stepNumber: 4,
        title: 'Autonomous Rover Agent Swarm',
        description: 'TerramechanicsSim approves path. AutonavPlanner directs rocker-bogie drives while DrillActuator readies bit.',
        activeLayer: 'agents',
        status: 'NORMAL',
        confidence: 99.0
      },
      {
        stepNumber: 5,
        title: 'Closed-Loop Coring Drill Execution',
        description: 'Drilling rock core sample with automated bit pressure adjustment based on real-time torque feedback.',
        activeLayer: 'robotics',
        status: 'NORMAL',
        confidence: 99.5
      }
    ]
  }
];

