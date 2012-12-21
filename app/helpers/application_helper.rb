module ApplicationHelper
  def body_classes
    classes = []
    classes << controller_path.gsub(/a-z0-9/, '-')
    classes << "#{classes.first}-#{action_name}"
    classes.join(' ')
  end
end
