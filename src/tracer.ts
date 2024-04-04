import tracer from "dd-trace";
tracer.init({
    logInjection: Boolean(process.env.DD_LOG_INJECTION) || true,
});

export default tracer;
