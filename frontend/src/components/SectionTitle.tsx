import { ScrollReveal } from "./animations";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  light?: boolean;
  titleClassName?: string;
}

const SectionTitle = ({ title, subtitle, light, titleClassName }: SectionTitleProps) => {
  return (
    <ScrollReveal className="text-center mb-12">
      <h2 className={`font-display text-3xl md:text-5xl mb-4 ${light ? "text-primary-foreground" : "text-foreground"} ${titleClassName || ""}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`font-body text-sm md:text-base max-w-2xl mx-auto leading-relaxed ${light ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
          {subtitle}
        </p>
      )}
    </ScrollReveal>
  );
};

export default SectionTitle;
