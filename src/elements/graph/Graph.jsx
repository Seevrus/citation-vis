/* eslint-disable @typescript-eslint/no-use-before-define */
import * as d3 from 'd3';
import { clone } from 'ramda';
import { useEffect, useRef } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import { 
  selectGraphData,
  selectMinMaxCitations,
  setGraph,
  setMinMaxCitations,
  setSelectedArticleId,
} from '../../store/citations/citations';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import ArticleCard from '../cards/ArticleCard';

import './graph.css';

const Graph = () => {
  const dispatch = useAppDispatch();

  const graphHeight = 800;
  const graphWidth = 960;
  const svgRef = useRef(null);
  const graphData = useAppSelector(selectGraphData);
  const minMaxCitations = useAppSelector(selectMinMaxCitations);
  const colors = d3.scaleSequential(d3.interpolateGreys);

  const forceStrength = 0.1;
  const charge = (d) => -Math.pow(d.citations, 1.5) * forceStrength;
  const simulation = 
    d3.forceSimulation()
      .force('link', d3.forceLink().id((d) => d.id))
      .force('charge', d3.forceManyBody().strength(charge))
      .force('center', d3.forceCenter(graphWidth / 2, graphHeight / 2));

  useEffect(
    () => {
      dispatch(setSelectedArticleId(null));
    },
    [dispatch],
  );
  
  useEffect(
    () => {
      if (!graphData) dispatch(setGraph());
    },
    [dispatch, graphData],
  );

  useEffect(
    () => {
      if (!minMaxCitations) dispatch(setMinMaxCitations());
    },
    [dispatch, minMaxCitations],
  );
  
  useEffect(
    () => {
      const svgEl = d3.select(svgRef.current);
      let node, link, edgepaths, minYear, maxYear;

      const calculateSizeFromCitations = (citations) => {
        if (!minMaxCitations) return 1;
        
        const minCitations = minMaxCitations[0] == 0 ? 1 : minMaxCitations[0];
    
        return (Math.log10(citations) - Math.log10(minCitations)) / (Math.log10(minMaxCitations[1]) - Math.log10(minCitations)) * 10;
      };

      const createElements = (data) => {
        minYear = d3.min(data.nodes, d => d.year);
        maxYear = d3.max(data.nodes, d => d.year);
        const normalizeYear = year => (year - minYear) / (maxYear - minYear);
        d3.select('body').on('keydown', keyPressed);
        d3.select('#graph-container').on('click', nodeClicked);
        
        svgEl
          .selectAll('*')
          .remove();

        const svg = svgEl
          .append('g')
          .attr('transform', 'translate(0,0)')
          .call(
            d3.zoom()
              .extent([[0, 0], [graphWidth, graphHeight]])
              .on('zoom', zoomed),
          );
        
        svg
          .append('defs')
          .append('marker')
          .attr('id', 'arrowhead')
          .attr('viewBox', '-0 -5 10 10')
          .attr('refX', 10)
          .attr('refY', 0)
          .attr('orient', 'auto')
          .attr('markerWidth', 10)
          .attr('markerHeight', 10)
          .attr('xoverflow', 'visible')
          .append('svg:path')
          .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
          .attr('fill', '#999')
          .style('stroke', 'none');
        
        link = svg
          .selectAll('.link')
          .data(data.links)
          .enter()
          .append('line')
          .attr('class', 'link')
          .attr('marker-end', 'url(#arrowhead)');
        
        edgepaths = svg
          .selectAll('.edgepath')
          .data(data.links)
          .enter()
          .append('path')
          .attr('class', 'edgepath')
          .attr('fill-opacity', 0)
          .attr('stroke-opacity', 0)
          .style('pointer-events', 'none');

        node = svg.selectAll('.node')
          .data(data.nodes)
          .enter()
          .append('g')
          .attr('class', 'node');

        node.append('circle')
          .attr('r', d => calculateSizeFromCitations(d.citations))
          .style('fill', d => colors(normalizeYear(d.year)))
          .style('stroke', d => d3.rgb(colors(normalizeYear(d.year))).darker());

        node
          .append('title')
          .text(d => d.title);
        
        node
          .append('id')
          .text(d => d.id);
        
        node
          .on('mouseover', nodeMouseOver)
          .on('mouseout', nodeMouseOut);

        function keyPressed({ code }) {
          const currTransform = svg.attr('transform');
          const firstOpenPIndex = currTransform.indexOf('(');
          const firstClosingPIndex = currTransform.indexOf(')');
          const secondOpenPIndex = currTransform.indexOf('(', firstOpenPIndex + 1);
          const secondClosingPIndex = currTransform.indexOf(')', firstClosingPIndex + 1);

          const currXY = currTransform.substring(
            firstOpenPIndex + 1,
            firstClosingPIndex,
          ).split(',');
          const currScale = secondOpenPIndex !== -1
            ? Number(currTransform.substring(secondOpenPIndex + 1, secondClosingPIndex))
            : 1;

          switch (code) {
            case 'KeyS':
              svg.attr(
                'transform',
                `translate(${Number(currXY[0])},${Number(currXY[1]) + 30}) scale(${currScale})`,
              );
              break;
            case 'KeyW':
              svg.attr(
                'transform',
                `translate(${Number(currXY[0])},${Number(currXY[1]) - 30}) scale(${currScale})`,
              );
              break;
            case 'KeyA':
              svg.attr(
                'transform',
                `translate(${Number(currXY[0]) - 30},${Number(currXY[1])}) scale(${currScale})`,
              );
              break;
            case 'KeyD':
              svg.attr(
                'transform',
                `translate(${Number(currXY[0]) + 30},${Number(currXY[1])}) scale(${currScale})`,
              );
              break;
            case 'Space':
              svg.attr(
                'transform',
                `translate(0,0) scale(${currScale})`,
              );
              break;
          }
        }

        function nodeClicked(e) {
          if (e.target.nodeName === 'circle') {
            const nodeId = Number(d3.select(e.target).node().parentNode.getElementsByTagName('id')[0].innerHTML);
            dispatch(setSelectedArticleId(nodeId));
            node.select('circle').style('stroke', d => d3.rgb(colors(normalizeYear(d.year))).darker());
            d3.select(e.target).style('stroke', 'black');
          } else {
            dispatch(setSelectedArticleId(null));
            d3.selectAll('circle').style('stroke', d => d3.rgb(colors(normalizeYear(d.year))).darker());
          }
        }

        function nodeMouseOver() {
          const nodeId = Number(this.getElementsByTagName('id')[0].innerHTML);
          node.select('circle').style('fill', '#B8B8B8');
          d3.select(this).select('circle').style('fill', node_d => colors(normalizeYear(node_d.year)));

          link
            .attr('class', function (link_d) {
              return link_d.source.id === nodeId || link_d.target.id === nodeId
                ? 'active-link'
                : 'link';
            })
            .attr('marker-end', function (link_d) {
              return link_d.source.id === nodeId || link_d.target.id === nodeId
                ? 'none'
                : 'url(#arrowhead)';
            });
        }

        function nodeMouseOut() {
          node.select('circle').style('fill', d => colors(normalizeYear(d.year)));
          link
            .attr('class', 'link')
            .attr('marker-end', 'url(#arrowhead)');
        }

        function zoomed({ transform }) {
          svg.attr('transform', transform);
        }
      };

      const updateElements = () => {
        link
          .attr('x1', function (d) {return d.source.x;})
          .attr('y1', function (d) {return d.source.y;})
          .attr('x2', function (d) {return d.target.x;})
          .attr('y2', function (d) {return d.target.y;});

        node
          .attr('transform', function (d) {return 'translate(' + d.x + ', ' + d.y + ')';});

        edgepaths.attr('d', function (d) {
          return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
        });
      };

      if (!!graphData && !!simulation) {
        const dataToShow = clone(graphData);
        createElements(dataToShow);
        simulation.nodes(dataToShow.nodes).on('tick', updateElements);
        simulation.force('link').links(dataToShow.links);
      }
    },
    [colors, dispatch, graphData, minMaxCitations, simulation, svgRef],
  );

  return (
    <Container fluid id="graph-container">
      <Row>
        <Col lg={8}>
          <svg ref={svgRef} width={graphWidth} height={graphHeight} id="graph-container" />
        </Col>
        <ArticleCard />
      </Row>
    </Container>
  );
};

export default Graph;
