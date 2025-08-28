const H1 = ({ children, className = "" }) => (
    <h1 className={`text-4xl font-bold my-10 ${className}`}>{children}</h1>
);

const H2 = ({ children, className = "" }) => (
    <h2 className={`text-2xl font-semibold my-5 border-t-1 border-foreground/20 pt-3 ${className}`}>{children}</h2>
);

const H3 = ({ children, className = "" }) => (
    <h3 className={`text-1.5xl font-semibold my-3 ${className}`}>{children}</h3>
);

const Paragraph = ({ children, className = "" }) => (
    <p className={`text-lg text-foreground/50 leading-relaxed ${className}`}>{children}</p>
);

const Caption = ({ children, className = "" }) => (
    <span className={`text-sm text-gray-500 ${className}`}>{children}</span>
);

const Typography = {
    H1,
    H2,
    H3,
    Paragraph,
    Caption,
};

export default Typography;
