// ===============================================================
//                       CONFIGURATION
// ===============================================================

const EXERCISE_CONFIG = {
  bicep_curl: {
    landmarks: [12, 14, 16],
    angle_range: [40, 160],
    progress_type: 'normal',
    timing: { concentric: 2, hold: 1, eccentric: 3, tolerance: 0.7 },
    form_checks: [
      {
        check_type: 'angle',
        landmarks: [24, 12, 14],
        threshold: 30,
        condition: (a, t) => a > t,
        feedback: 'PIN YOUR ELBOW',
      },
      {
        check_type: 'visibility',
        landmarks: [12, 14, 16, 24],
        feedback: 'KEEP RIGHT UPPER BODY VISIBLE',
      },
    ],
    visibility_check: {
      landmarks: [12, 14, 16, 24],
      feedback: 'SHOW RIGHT UPPER BODY',
    },
  },
  squat: {
    landmarks: [24, 26, 28],
    angle_range: [90, 175],
    progress_type: 'normal',
    timing: { concentric: 2, hold: 1, eccentric: 1, tolerance: 1 },
    form_checks: [
      {
        check_type: 'angle',
        landmarks: [12, 24, 26],
        threshold: 80,
        condition: (a, t) => a < t,
        feedback: 'KEEP CHEST UP',
      },
      {
        check_type: 'angle',
        landmarks: [24, 26, 28],
        threshold: 80,
        condition: (a, t) => a < t,
        feedback: 'SQUAT TOO DEEP',
      },
      {
        check_type: 'visibility',
        landmarks: [12, 24, 26, 28],
        feedback: 'KEEP WHOLE RIGHT BODY VISIBLE',
      },
    ],
    visibility_check: {
      landmarks: [12, 24, 26, 28, 32],
      feedback: 'SHOW RIGHT FULL BODY',
    },
  },
  wall_push_up: {
    landmarks: [12, 14, 16],
    angle_range: [90, 160],
    progress_type: 'normal',
    timing: { concentric: 4, hold: 1, eccentric: 2, tolerance: 0.7 },
    form_checks: [
      {
        check_type: 'angle',
        landmarks: [12, 24, 28], // R_Shoulder, R_Hip, R_Ankle
        threshold: 160,
        condition: (a, t) => a < t,
        feedback: 'KEEP BACK STRAIGHT',
      },
      {
        check_type: 'positional',
        landmarks: [12, 24], // R_Shoulder, R_Hip
        condition: (shoulder, hip) => Math.abs(shoulder.x - hip.x) / Math.abs(shoulder.y - hip.y) < 0.15,
        feedback: 'LEAN FORWARD MORE',
      },
      {
        check_type: 'positional',
        landmarks: [14, 12], // R_Elbow, R_Shoulder
        condition: (elbow, shoulder) => elbow.y < shoulder.y - 30,
        feedback: 'TUCK YOUR ELBOWS',
      },
      {
        check_type: 'positional',
        landmarks: [16, 12], // R_Wrist, R_Shoulder
        condition: (wrist, shoulder) => wrist.y < shoulder.y,
        feedback: 'LOWER YOUR HANDS',
      },
      {
        check_type: 'visibility',
        landmarks: [12, 14, 16, 24],
        feedback: 'KEEP RIGHT UPPER BODY VISIBLE',
      },
    ],
    visibility_check: {
      landmarks: [12, 14, 16, 24],
      feedback: 'SHOW RIGHT UPPER BODY',
    },
  },
  glute_bridge: {
    landmarks: [12, 24, 26], // R_Shoulder, R_Hip, R_Knee
    angle_range: [130, 170],
    progress_type: 'inverse',
    timing: { concentric: 2, hold: 2, eccentric: 3, tolerance: 0.7 },
    form_checks: [
      {
        check_type: 'angle',
        landmarks: [12, 24, 26],
        threshold: 180,
        condition: (a, t) => a > t,
        feedback: 'AVOID ARCHING BACK',
      },
      {
        check_type: 'angle',
        landmarks: [24, 26, 28],
        threshold: 110,
        condition: (a, t) => a > t,
        feedback: 'KEEP FEET CLOSER',
      },
      {
        check_type: 'positional',
        landmarks: [12, 28], // R_Shoulder, R_Ankle
        condition: (shoulder, ankle) => Math.abs(shoulder.y - ankle.y) > 40,
        feedback: 'KEEP SHOULDERS & FEET ON GROUND',
      },
      {
        check_type: 'visibility',
        landmarks: [12, 24, 26, 28],
        feedback: 'KEEP WHOLE RIGHT BODY VISIBLE',
      },
    ],
    visibility_check: {
      landmarks: [12, 24, 26, 28],
      feedback: 'SHOW FULL RIGHT SIDE OF BODY',
    },
  },
  seated_leg_raise: {
    landmarks: [24, 26, 28], // R_Hip, R_Knee, R_Ankle
    angle_range: [90, 155],
    progress_type: 'inverse',
    timing: { concentric: 3, hold: 2, eccentric: 4, tolerance: 0.7 },
    form_checks: [
      {
        check_type: 'angle',
        landmarks: [12, 24, 26],
        threshold: 110,
        condition: (a, t) => a > t,
        feedback: 'SIT UP STRAIGHT',
      },
      {
        check_type: 'positional',
        landmarks: [26, 24], // R_Knee, R_Hip
        condition: (knee, hip) => knee.y < hip.y,
        feedback: 'KEEP THIGH ON CHAIR',
      },
      {
        check_type: 'visibility',
        landmarks: [12, 24, 26, 28],
        feedback: 'KEEP WHOLE RIGHT BODY VISIBLE',
      },
    ],
    visibility_check: {
      landmarks: [12, 24, 26, 28],
      feedback: 'SHOW FULL RIGHT SIDE OF BODY',
    },
  },
};

const UI_CONFIG = {
  colors: {
    bg: 'rgba(0, 0, 0, 0.8)',
    good: '#00ff00',
    bad: '#ff0000',
    warning: '#ffa500',
    neutral: '#ffffff',
    text_dark_bg: '#000000',
  },
  feedback_box: { x: 280, y: 550, w: 770, h: 100 },
  rep_counter_box: { x: 0, y: 450, w: 250, h: 270 },
  movement_bar: { x: 1100, y: 100, w: 75, h: 550 },
  pace_bar: { x: 300, y: 660, w: 730, h: 30 },
};

// ADDED: Define clickable area for the skip button
const skip_button_area = { x: 540, y: 550, w: 200, h: 60 };

// ===============================================================
//                POSE DETECTION & TRACKING LOGIC
// ===============================================================

class Exercise {
  constructor(config) {
    this.landmarks = config.landmarks;
    this.angle_range = config.angle_range;
    this.type = config.progress_type;
    this.form_checks = config.form_checks || [];
    const timing = config.timing || {};
    this.concentric_time = timing.concentric || 3;
    this.hold_time = timing.hold || 1;
    this.eccentric_time = timing.eccentric || 3;
    this.time_tolerance = timing.tolerance || 0.5;
    this.total_rep_time = this.concentric_time + this.hold_time + this.eccentric_time;
    this.good_reps = 0;
    this.bad_reps = 0;
    this.stage = 'down';
    this.stage_start_time = Date.now() / 1000;
    this.feedback_set_time = Date.now() / 1000;
    this.form_feedback = 'START';
    this.speed_feedback = 'START';
    this.rep_timing_is_good = true;
  }
  _calculate_angle(p1, p2, p3) {
    const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    return angle;
  }
  _interp(x, in_min, in_max, out_min, out_max) {
    return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  }
  _calculate_percentage(angle) {
    let percentage;
    if (this.type === 'inverse') {
      percentage = this._interp(angle, this.angle_range[0], this.angle_range[1], 0, 100);
    } else {
      percentage = this._interp(angle, this.angle_range[0], this.angle_range[1], 100, 0);
    }
    return Math.max(0, Math.min(100, percentage));
  }
  update(lmList) {
    let pace_progress = 0.0;
    const inter_stage_warnings = ['TOO FAST', 'TOO SLOW', 'HOLD AT TOP'];
    let angle;
    if (Array.isArray(this.landmarks[0])) {
      const angle1 = this._calculate_angle(
        lmList[this.landmarks[0][0]],
        lmList[this.landmarks[0][1]],
        lmList[this.landmarks[0][2]]
      );
      const angle2 = this._calculate_angle(
        lmList[this.landmarks[1][0]],
        lmList[this.landmarks[1][1]],
        lmList[this.landmarks[1][2]]
      );
      angle = (angle1 + angle2) / 2;
    } else {
      angle = this._calculate_angle(lmList[this.landmarks[0]], lmList[this.landmarks[1]], lmList[this.landmarks[2]]);
    }
    const per = this._calculate_percentage(angle);
    const bar = this._interp(
      per,
      0,
      100,
      UI_CONFIG.movement_bar.y + UI_CONFIG.movement_bar.h,
      UI_CONFIG.movement_bar.y
    );
    let current_form_is_good = true;
    this.form_feedback = 'GOOD';
    for (const check of this.form_checks) {
      const check_type = check.check_type || 'angle';
      if (check_type === 'visibility') {
        if (!check_body_visibility(lmList, check.landmarks)) {
          this.form_feedback = check.feedback;
          current_form_is_good = false;
          break;
        }
      } else if (check_type === 'positional') {
        const [lm1_id, lm2_id] = check.landmarks;
        if (lm1_id < lmList.length && lm2_id < lmList.length) {
          if (check.condition(lmList[lm1_id], lmList[lm2_id])) {
            this.form_feedback = check.feedback;
            current_form_is_good = false;
            break;
          }
        }
      } else {
        const check_angle = this._calculate_angle(
          lmList[check.landmarks[0]],
          lmList[check.landmarks[1]],
          lmList[check.landmarks[2]]
        );
        if (check.condition(check_angle, check.threshold)) {
          this.form_feedback = check.feedback;
          current_form_is_good = false;
          break;
        }
      }
    }
    const current_time = Date.now() / 1000;
    const elapsed_stage_time = current_time - this.stage_start_time;
    const is_moving = ['going_up', 'hold', 'going_down'].includes(this.stage);
    if ((!current_form_is_good && is_moving) || (per <= 5 && ['going_up', 'hold'].includes(this.stage))) {
      this.stage = 'down';
      this.speed_feedback = 'REP RESET';
      this.feedback_set_time = current_time;
    }
    const final_rep_messages = ['GOOD REP!', 'BAD TIMING', 'REP RESET', ...inter_stage_warnings];
    if (this.stage === 'down') {
      if (final_rep_messages.includes(this.speed_feedback) && current_time - this.feedback_set_time < 1.0) {
      } else {
        this.speed_feedback = 'LIFT UP';
      }
      if (per >= 10) {
        this.stage = 'going_up';
        this.stage_start_time = current_time;
        this.rep_timing_is_good = true;
      }
    } else if (this.stage === 'going_up') {
      if (inter_stage_warnings.includes(this.speed_feedback) && current_time - this.feedback_set_time < 0.5) {
      } else {
        this.speed_feedback = 'GO';
      }
      const progress_time = Math.min(elapsed_stage_time, this.concentric_time);
      pace_progress = progress_time / this.total_rep_time;
      if (per >= 90) {
        if (Math.abs(elapsed_stage_time - this.concentric_time) > this.time_tolerance) {
          this.speed_feedback = elapsed_stage_time < this.concentric_time ? 'TOO FAST' : 'TOO SLOW';
          this.feedback_set_time = current_time;
          this.rep_timing_is_good = false;
        }
        this.stage = 'hold';
        this.stage_start_time = current_time;
      } else if (elapsed_stage_time > this.concentric_time + this.time_tolerance) {
        this.speed_feedback = 'TOO SLOW';
        this.rep_timing_is_good = false;
      }
    } else if (this.stage === 'hold') {
      if (inter_stage_warnings.includes(this.speed_feedback) && current_time - this.feedback_set_time < 0.5) {
      } else {
        this.speed_feedback = 'HOLD';
      }
      const concentric_progress = this.concentric_time / this.total_rep_time;
      const hold_progress = elapsed_stage_time / this.total_rep_time;
      pace_progress = concentric_progress + hold_progress;
      if (per < 90) {
        this.speed_feedback = 'HOLD AT TOP';
        this.rep_timing_is_good = false;
        this.feedback_set_time = current_time;
        this.stage = 'going_down';
        this.stage_start_time = current_time;
      } else if (elapsed_stage_time >= this.hold_time) {
        this.stage = 'going_down';
        this.stage_start_time = current_time;
      }
    } else if (this.stage === 'going_down') {
      if (inter_stage_warnings.includes(this.speed_feedback) && current_time - this.feedback_set_time < 0.5) {
      } else {
        this.speed_feedback = 'BACK SLOWLY';
      }
      const concentric_hold_progress = (this.concentric_time + this.hold_time) / this.total_rep_time;
      const eccentric_progress = elapsed_stage_time / this.total_rep_time;
      pace_progress = concentric_hold_progress + eccentric_progress;
      if (per <= 5) {
        if (Math.abs(elapsed_stage_time - this.eccentric_time) > this.time_tolerance) {
          this.speed_feedback = elapsed_stage_time < this.eccentric_time ? 'TOO FAST' : 'TOO SLOW';
          this.rep_timing_is_good = false;
        }
        if (this.rep_timing_is_good && current_form_is_good) {
          this.good_reps++;
          this.speed_feedback = 'GOOD REP!';
        } else {
          this.bad_reps++;
          if (!inter_stage_warnings.includes(this.speed_feedback)) {
            this.speed_feedback = 'BAD TIMING';
          }
        }
        this.feedback_set_time = current_time;
        this.stage = 'down';
      }
    }
    pace_progress = Math.min(pace_progress, 1.0);
    return {
      angle,
      bar,
      per,
      good_reps: this.good_reps,
      bad_reps: this.bad_reps,
      form_feedback: this.form_feedback,
      speed_feedback: this.speed_feedback,
      pace_progress,
    };
  }
}

// ===============================================================
//                        UI & DRAWING FUNCTIONS
// ===============================================================

function check_body_visibility(lmList, required_ids, threshold = 0.7) {
  if (!lmList || lmList.length === 0) return false;
  for (const landmark_id of required_ids) {
    if (landmark_id >= lmList.length || lmList[landmark_id].visibility < threshold) {
      return false;
    }
  }
  return true;
}
function draw_visibility_prompt(ctx, text) {
  const { colors } = UI_CONFIG;
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 250, 1280, 250);
  ctx.fillStyle = colors.warning;
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('POSITION CHECK', 640, 340);
  ctx.font = 'bold 60px Arial';
  ctx.fillText(text, 640, 430);
}
function draw_feedback_box(ctx, form_feedback, speed_feedback) {
  const { x, y, w, h } = UI_CONFIG.feedback_box;
  const { colors } = UI_CONFIG;
  ctx.fillStyle = colors.bg;
  ctx.fillRect(x, y, w, h);
  const form_color = form_feedback === 'GOOD' ? colors.good : colors.bad;
  const warning_msgs = ['TOO FAST', 'TOO SLOW', 'REP RESET', 'HOLD AT TOP', 'BAD TIMING'];
  let speed_color = colors.neutral;
  if (warning_msgs.includes(speed_feedback)) {
    speed_color = colors.warning;
  } else if (speed_feedback === 'GOOD REP!') {
    speed_color = colors.good;
  }
  ctx.textAlign = 'left';
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = form_color;
  ctx.fillText(`FORM: ${form_feedback}`, x + 20, y + 40);
  ctx.fillStyle = speed_color;
  ctx.fillText(`SPEED: ${speed_feedback}`, x + 20, y + 85);
}
function draw_pace_bar(ctx, progress, handler) {
  const { x, y, w, h } = UI_CONFIG.pace_bar;
  const { colors } = UI_CONFIG;
  ctx.strokeStyle = colors.neutral;
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, h);
  const filled_w = w * progress;
  ctx.fillStyle = colors.good;
  ctx.fillRect(x, y, filled_w, h);
  const total_time = handler.total_rep_time;
  if (total_time > 0) {
    ctx.fillStyle = colors.text_dark_bg;
    ctx.lineWidth = 4;
    const concentric_end_x = x + w * (handler.concentric_time / total_time);
    const hold_end_x = concentric_end_x + w * (handler.hold_time / total_time);
    ctx.beginPath();
    ctx.moveTo(concentric_end_x, y);
    ctx.lineTo(concentric_end_x, y + h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hold_end_x, y);
    ctx.lineTo(hold_end_x, y + h);
    ctx.stroke();
  }
}
function draw_movement_bar(ctx, percentage, bar_value, form_is_good) {
  const { x, y, w, h } = UI_CONFIG.movement_bar;
  const color = form_is_good ? UI_CONFIG.colors.good : UI_CONFIG.colors.bad;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(x, bar_value, w, y + h - bar_value);
  ctx.font = 'bold 50px Arial';
  ctx.textAlign = 'left';
  ctx.fillStyle = color;
  ctx.fillText(`${Math.round(percentage)}%`, x, y - 25);
}
function draw_rep_counter(ctx, good_reps, bad_reps) {
  const { x, y, w, h } = UI_CONFIG.rep_counter_box;
  const { colors } = UI_CONFIG;
  ctx.fillStyle = colors.bg;
  ctx.fillRect(x, y, w, h);
  ctx.textAlign = 'left';
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = colors.good;
  ctx.fillText('GOOD', x + 25, y + 50);
  ctx.font = 'bold 100px Arial';
  ctx.fillText(String(good_reps).padStart(2, '0'), x + 45, y + 150);
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = colors.bad;
  ctx.fillText('BAD', x + 35, y + 200);
  ctx.font = 'bold 60px Arial';
  ctx.fillText(String(bad_reps).padStart(2, '0'), x + 45, y + 260);
}
// MODIFIED: This function now handles changing text and drawing a skip button
function draw_rest_screen(ctx, remaining_time, main_text = 'REST', show_skip_button = false) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.fillStyle = UI_CONFIG.colors.good;
  ctx.font = 'bold 100px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(main_text, 640, 300);
  ctx.font = 'bold 150px Arial';
  ctx.fillText(remaining_time, 640, 450);

  if (show_skip_button) {
    const { x, y, w, h } = skip_button_area;
    ctx.strokeStyle = UI_CONFIG.colors.neutral;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = UI_CONFIG.colors.neutral;
    ctx.font = 'bold 40px Arial';
    ctx.fillText('SKIP', 640, y + 45);
  }
}
function draw_header_info(ctx, exercise_name, set_info) {
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, 1280, 120);
  ctx.fillStyle = UI_CONFIG.colors.neutral;
  ctx.font = 'bold 30px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Exercise: ${exercise_name.replace(/_/g, ' ').toUpperCase()}`, 50, 50);
  if (set_info) {
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`SET ${set_info.current} OF ${set_info.total}`, 1230, 75);
  }
}
function draw_countdown(ctx, remaining_time) {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.fillStyle = UI_CONFIG.colors.bad;
  ctx.font = 'bold 100px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('GET READY!', 640, 300);
  ctx.font = 'bold 150px Arial';
  ctx.fillText(remaining_time, 640, 450);
}
function draw_active_landmarks(ctx, lmList, landmarkIds, angle) {
  if (!landmarkIds.every((id) => id < lmList.length)) {
    return;
  }
  const [p1, p2, p3] = landmarkIds.map((id) => lmList[id]);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.stroke();
  ctx.fillStyle = '#ffaa00';
  [p1, p2, p3].forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10, 0, 2 * Math.PI);
    ctx.fill();
  });
  ctx.fillStyle = 'white';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(Math.round(angle) + '°', p2.x + 20, p2.y - 20);
}

// ===============================================================
//                        MAIN APPLICATION
// ===============================================================

let pose;
let camera;
let exercise_handler;
let program_state;
let workout_plan = [];
let current_exercise_name = 'bicep_curl';
let target_reps = 0;
let target_sets = 0;
let current_set = 1;

const countdown_duration = 5;
let countdown_start_time = 0;

const rest_duration = 30;
let rest_start_time = 0;

window.setWorkoutPlan = (plan) => {
  workout_plan = plan;
  console.log('Workout plan loaded into script:', workout_plan);
};

window.startPoseTracker = (videoElement, canvasElement, controlsElement, initialSet = 1) => {
  // MODIFIED: Accept elements as arguments
  if (window.isPoseTrackerActive) return;

  // ADDED: Check if elements were passed correctly
  if (!videoElement || !canvasElement || !controlsElement) {
    console.error('PoseTracker failed: Required DOM elements were not provided.');
    return;
  }
  console.log('Starting Pose Tracker with provided elements...');

  const canvasCtx = canvasElement.getContext('2d');

  const onResults = (results) => {
    if (!canvasCtx || !canvasElement) return;

    const set_info = { current: current_set, total: target_sets };

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    const lmList = results.poseLandmarks
      ? results.poseLandmarks.map((lm) => ({
          x: lm.x * canvasElement.width,
          y: lm.y * canvasElement.height,
          visibility: lm.visibility,
        }))
      : [];

    if (program_state === 'WAITING_FOR_BODY') {
      draw_header_info(canvasCtx, current_exercise_name, set_info);
      const is_visible = check_body_visibility(
        lmList,
        EXERCISE_CONFIG[current_exercise_name].visibility_check.landmarks
      );
      if (is_visible) {
        program_state = 'COUNTDOWN';
        countdown_start_time = Date.now() / 1000;
      } else {
        draw_visibility_prompt(canvasCtx, EXERCISE_CONFIG[current_exercise_name].visibility_check.feedback);
      }
    } else if (program_state === 'COUNTDOWN') {
      draw_header_info(canvasCtx, current_exercise_name, set_info);
      const time_since_start = Date.now() / 1000 - countdown_start_time;
      if (time_since_start >= countdown_duration) {
        program_state = 'TRACKING';
      } else {
        draw_countdown(canvasCtx, Math.ceil(countdown_duration - time_since_start));
      }
    } else if (program_state === 'RESTING') {
      // MODIFIED: Logic for changing text and showing skip button
      draw_header_info(canvasCtx, current_exercise_name, set_info);
      const time_since_start = Date.now() / 1000 - rest_start_time;
      const remaining_time = Math.ceil(rest_duration - time_since_start);

      if (time_since_start >= rest_duration) {
        // Reset for the next set
        resetState(current_exercise_name, false); // false = don't reset set counter
      } else {
        let mainText = 'REST';
        if (remaining_time <= 3) {
          mainText = 'PREPARE YOURSELF';
        }
        draw_rest_screen(canvasCtx, remaining_time, mainText, true);
      }
    } else if (program_state === 'TRACKING') {
      let ui_data = {
        bar: UI_CONFIG.movement_bar.y + UI_CONFIG.movement_bar.h,
        per: 0,
        pace_progress: 0.0,
        form_feedback: 'NO PERSON DETECTED',
        speed_feedback: '',
        good_reps: exercise_handler.good_reps,
        bad_reps: exercise_handler.bad_reps,
      };

      if (lmList.length !== 0) {
        ui_data = exercise_handler.update(lmList);
        draw_active_landmarks(canvasCtx, lmList, exercise_handler.landmarks, ui_data.angle);
      }

      // --- SET AND REP LOGIC ---
      const total_reps_done = ui_data.good_reps + ui_data.bad_reps;
      if (total_reps_done >= target_reps) {
        // Dispatch a custom event with the results of the set
        window.dispatchEvent(
          new CustomEvent('setFinished', {
            detail: {
              configKey: current_exercise_name,
              goodRepsInSet: exercise_handler.good_reps,
              badRepsInSet: exercise_handler.bad_reps,
              completedSetNumber: current_set,
            },
          })
        );

        current_set++;
        if (current_set > target_sets) {
          console.log(`${current_exercise_name} finished. Notifying React.`);
          window.dispatchEvent(new Event('exerciseFinished'));
          program_state = 'FINISHED'; // Stop processing
        } else {
          program_state = 'RESTING';
          rest_start_time = Date.now() / 1000;
        }
      }

      draw_feedback_box(canvasCtx, ui_data.form_feedback, ui_data.speed_feedback);
      draw_pace_bar(canvasCtx, ui_data.pace_progress, exercise_handler);
      draw_movement_bar(canvasCtx, ui_data.per, ui_data.bar, ui_data.form_feedback === 'GOOD');
      draw_rep_counter(canvasCtx, ui_data.good_reps, ui_data.bad_reps);
      draw_header_info(canvasCtx, current_exercise_name, set_info);
    }
    canvasCtx.restore();
  };

  const resetState = (new_exercise, reset_set_counter = true, startingSet = 1) => {
    current_exercise_name = new_exercise || current_exercise_name;

    const exerciseDetails = workout_plan.find((ex) => ex.configKey === current_exercise_name);
    if (exerciseDetails) {
      target_reps = exerciseDetails.reps;
      target_sets = exerciseDetails.sets;
    } else {
      console.error(`Exercise ${current_exercise_name} not found in workout plan!`);
      target_reps = 10;
      target_sets = 3;
    }

    // MODIFIED: Use the provided starting set number
    current_set = reset_set_counter ? startingSet : current_set;

    exercise_handler = new Exercise(EXERCISE_CONFIG[current_exercise_name]);
    program_state = 'WAITING_FOR_BODY';
    console.log(`State reset for: ${current_exercise_name}. Set ${current_set}/${target_sets}, Reps ${target_reps}`);
  };

  const handleButtonClick = (e) => {
    if (e.target.tagName !== 'BUTTON') return;
    const new_exercise = e.target.id.replace('btn-', '');
    if (new_exercise !== current_exercise_name) {
      // MODIFIED: Use the passed-in controlsElement to find the buttons
      controlsElement.querySelectorAll('.exercise-btn').forEach((btn) => btn.classList.remove('active'));
      e.target.classList.add('active');
      resetState(new_exercise, true);
    }
  };

  pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
  });
  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: true,
    smoothSegmentation: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
  pose.onResults(onResults);

  camera = new Camera(videoElement, {
    onFrame: async () => {
      await pose.send({ image: videoElement });
    },
    width: 1280,
    height: 720,
  });
  camera.start();

  // ADDED: Click listener on the canvas for the skip button
  const handleCanvasClick = (event) => {
    if (program_state !== 'RESTING') return;

    const rect = canvasElement.getBoundingClientRect();
    const scaleX = canvasElement.width / rect.width;
    const scaleY = canvasElement.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const btn = skip_button_area;
    if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
      console.log('Skip button clicked! Ending rest.');
      resetState(current_exercise_name, false); // End rest immediately
    }
  };

  canvasElement.addEventListener('click', handleCanvasClick);
  controlsElement.addEventListener('click', handleButtonClick);

  window.poseTrackerInstances = { pose, camera, listener: handleButtonClick, canvasClickListener: handleCanvasClick };

  resetState(workout_plan[0]?.configKey || 'bicep_curl', true, initialSet);
  window.isPoseTrackerActive = true;
};

window.stopPoseTracker = () => {
  if (!window.isPoseTrackerActive || !window.poseTrackerInstances) return;
  console.log('Stopping Pose Tracker...');

  // MODIFIED: Destructure canvasClickListener to remove it
  const { pose, listener, canvasClickListener } = window.poseTrackerInstances;
  const controlsElement = document.querySelector('.controls');
  const videoElement = document.querySelector('.input_video');
  const canvasElement = document.querySelector('.output_canvas');

  // --- CORRECTED SECTION ---
  // Stop the camera stream by stopping all of its tracks.
  if (videoElement && videoElement.srcObject) {
    const stream = videoElement.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop()); // This turns off the camera light
    videoElement.srcObject = null;
  }

  // Close the pose model instance
  if (pose) {
    pose.close();
  }

  // Remove the event listener
  if (controlsElement && listener) {
    controlsElement.removeEventListener('click', listener);
  }
  // ADDED: Remove the canvas click listener
  if (canvasElement && canvasClickListener) {
    canvasElement.removeEventListener('click', canvasClickListener);
  }

  // Clear the canvas
  if (canvasElement) {
    const canvasCtx = canvasElement.getContext('2d');
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  }

  // Reset state
  window.isPoseTrackerActive = false;
  window.poseTrackerInstances = null;
};
