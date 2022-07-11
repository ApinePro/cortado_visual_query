export class BPMN_Constant {
  public static EVENT_HEIGHT = 40;
  public static EVENT_WIDTH = 120;
  public static HORIZONTALSPACING = 20;
  public static VERTICALSPACING = 15;
  public static START_END_RADIUS = 20;

  public static LINE_COLOR = 'black';

  public static bpmn_node_height_width = 30;
  public static bpmn_stroke_width = 1;
  public static bpmn_stroke_color = 'gray';
  public static bpmn_corner_radius = '3';
  public static bpmn_invisible_font_size = '2em';
  public static bpmn_operator_font_size = '1.5em';
  public static bpmn_visible_font_size = '12px';

  public static operatorNodewidth =
    this.bpmn_node_height_width + this.bpmn_stroke_width;
  public static rectCenter = this.operatorNodewidth / 2;
  public static rectDiagLen =
    Math.pow(2 * Math.pow(this.operatorNodewidth, 2), 0.5) / 2;

  public static nonSelectedBPMNStrokeColor = 'gray';
  public static bpmn_operator_color = '#404040';
  public static bpmn_visible_activity_color = '#8f8f8f';
  public static bpmn_non_visible_activity_color = '#181818';
}