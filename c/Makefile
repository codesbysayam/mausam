# ====================================================================
# MAUSAM - Atmospheric Intelligence Platform
# Makefile for C Scientific Numerical Engine
# ====================================================================

CC ?= gcc
CFLAGS ?= -O3 -fPIC -Wall -Wextra -pedantic -std=c11
LDFLAGS ?= -shared
LIBS ?= -lm

INCDIR = include
SRCDIR = numerical
BINDIR = bin
LIBDIR = lib

SRCS = $(SRCDIR)/atmospheric_math.c \
       $(SRCDIR)/rolling_statistics.c \
       $(SRCDIR)/spatial_interpolation.c \
       $(SRCDIR)/verification_metrics.c \
       $(SRCDIR)/mausam_numerical.c

OBJS = $(SRCS:.c=.o)
TARGET_LIB = $(LIBDIR)/libmausam_numerical.so
BENCHMARK_BIN = $(BINDIR)/mausam_benchmark

.PHONY: all clean benchmark test

all: $(TARGET_LIB) $(BENCHMARK_BIN)

$(LIBDIR):
	mkdir -p $(LIBDIR)

$(BINDIR):
	mkdir -p $(BINDIR)

$(TARGET_LIB): $(OBJS) | $(LIBDIR)
	$(CC) $(LDFLAGS) -o $@ $(OBJS) $(LIBS)
	@echo "Compiled shared numerical library: $@"

$(SRCDIR)/%.o: $(SRCDIR)/%.c
	$(CC) $(CFLAGS) -I$(INCDIR) -c $< -o $@

$(BENCHMARK_BIN): $(SRCDIR)/benchmark.c $(OBJS) | $(BINDIR)
	$(CC) $(CFLAGS) -I$(INCDIR) $< $(OBJS) -o $@ $(LIBS)
	@echo "Compiled benchmark binary: $@"

benchmark: $(BENCHMARK_BIN)
	@echo "Running C Numerical Engine Benchmarks..."
	@./$(BENCHMARK_BIN)

test: benchmark

clean:
	rm -f $(SRCDIR)/*.o
	rm -rf $(LIBDIR) $(BINDIR)
