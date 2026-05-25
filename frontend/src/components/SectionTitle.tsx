import { ScrollReveal } from "./animations";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  light?: boolean;
}

const SectionTitle = ({ title, subtitle, light }: SectionTitleProps) => {
  return (
    <ScrollReveal className="text-center mb-12">
      <h2 className={`font-display text-3xl md:text-5xl mb-4 ${light ? "text-primary-foreground" : "text-foreground"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`font-body text-sm md:text-base max-w-2xl mx-auto leading-relaxed ${light ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
          {subtitle}
        </p>
      )}
      <div className={`w-16 h-px mx-auto mt-6 ${light ? "bg-primary-foreground/30" : "bg-accent"}`} />
    </ScrollReveal>
  );
};

export default SectionTitle;
