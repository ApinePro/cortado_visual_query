/*
  Defines tree constants that should be directly applied to each SVG element
  and that form the basic visualization of the tree.
  This allows for us to export the styled tree
*/

export class PT_Constant {
  public static tree_node_height_width = 30;
  public static export_offset = 20;
  public static nodeSpacing = 20;
  
  public static tree_stroke_width = '2';
  public static tree_stroke_color = 'gray';
  public static tree_corner_radius = '3';
  public static node_invisible_font_size = '2em';
  public static node_operator_font_size = '1.5em';
  public static node_visible_font_size = '12px';
  
  public static nonSelectedTreeNodeStrokeColor = 'gray';
  public static node_operator_color = '#404040';
  public static node_visible_activity_color = '#8f8f8f';
  public static node_non_visible_activity_color = '#181818';
}


