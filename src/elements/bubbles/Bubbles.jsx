/* eslint-disable @typescript-eslint/no-use-before-define */
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import {
  selectSubjects,
  setArticleList,
  setSelectedArticleId,
  setSubjects,
} from '../../store/citations/citations';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import CardWrapper from '../cards/CardWrapper';

import './bubbles.css';

const Bubbles = () => {
  const dispatch = useAppDispatch();

  const imgHeight = 800;
  const imgWidth = 960;
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const subjectData = useAppSelector(selectSubjects);

  const center = {
    x: imgWidth / 2,
    y: imgHeight / 2,
  };
  const forceStrength = 0.03;
  const charge = (d) => -Math.pow(d.radius, 2.0) * forceStrength;
  const simulation = d3.forceSimulation()
    .velocityDecay(0.2)
    .force('x', d3.forceX().strength(forceStrength).x(center.x))
    .force('y', d3.forceY().strength(forceStrength).y(center.y))
    .force('charge', d3.forceManyBody().strength(charge));
  const colors = d3.scaleOrdinal(d3.schemeCategory10);

  useEffect(
    () => {
      dispatch(setSelectedArticleId(null));
    },
    [dispatch],
  );

  useEffect(
    () => {
      if (!subjectData) {
        dispatch(setSubjects());
      }
    },
    [dispatch, subjectData],
  );

  useEffect(
    () => {
      let body, bubbles;
      const svgEl = d3.select(svgRef.current);

      const createElements = (nodes) => {
        d3.select('#bubble-container').on('click', onMouseClick);

        svgEl.selectAll('*').remove();

        body = svgEl
          .append('g')
          .attr('transform', 'translate(0,0)');
        
        bubbles = body
          .selectAll('.bubble')
          .data(nodes)
          .enter()
          .append('g')
          .attr('class', 'bubble');
        
        bubbles
          .append('circle')
          .attr('r', 0)
          .style('fill', colors(0))
          .style('stroke', d3.rgb(colors(0)).darker());
        
        bubbles
          .append('id')
          .text(d => d.subject);
        
        bubbles
          .select('circle')
          .transition()
          .duration(2000)
          .attr('r', d => d.radius);
        
        bubbles
          .append('text')
          .attr('class', 'subject-title')
          .text(d => d.subject);
        
        bubbles
          .on('mouseover', onMouseOver)
          .on('mouseout', onMouseOut);
        
        function onMouseOver() {
          bubbles.select('circle').style('fill', '#B8B8B8');
          d3.select(this).select('circle').style('fill', colors(0));
          d3
            .select(this)
            .raise()
            .select('text')
            .attr('class', 'subject-title-highlighted');
        }

        function onMouseOut() {
          bubbles.select('circle').style('fill', colors(0));

          d3
            .selectAll('text')
            .attr('class', 'subject-title');
        }

        function onMouseClick(e) {
          if (e.target.nodeName === 'circle') {
            const subject = d3.select(e.target).node().parentNode.getElementsByTagName('text')[0].innerHTML;
            dispatch(setArticleList({
              listType: 'subject',
              keyword: subject,
            }));
            dispatch(setSelectedArticleId(null));

            bubbles.select('circle').style('stroke', d3.rgb(colors(0)).darker());
            d3.select(e.target).style('stroke', 'black');
          } else {
            dispatch(setArticleList(null));
            dispatch(setSelectedArticleId(null));

            d3.selectAll('circle').style('stroke', d3.rgb(colors(0)).darker());
          }
        }
      };

      const updateElements = () => {
        bubbles
          .select('circle')
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);
        
        bubbles
          .select('text')
          .attr('x', d => d.x)
          .attr('y', d => d.y);
        
        const bounds = svgEl.node().getBBox();
        const parent = svgEl.node().parentElement;
        const fullWidth = parent.clientWidth;
        const fullHeight = parent.clientHeight;
        const width = bounds.width;
        const height = bounds.height;
        const midX = bounds.x + width / 2;
        const midY = bounds.y + height / 2;
        if (width == 0 || height == 0) return; // nothing to fit
        const scale = 0.75 / Math.max(width / fullWidth, height / fullHeight);
        const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];
      
        const transform = d3.zoomIdentity
          .translate(translate[0], translate[1])
          .scale(scale);

        body
          .transition()
          .duration(100)
          .attr('transform', transform);
      };

      if (subjectData && simulation) {
        const maxCount = d3.max(subjectData.nodes, d => d.count);
        const radiusScale = d3.scalePow()
          .exponent(0.5)
          .range([2, 150])
          .domain([0, maxCount]);
        
        const nodes = subjectData.nodes.map((n) => ({
          ...n,
          radius: radiusScale(n.count),
        }));
        
        createElements(nodes);
        simulation.nodes(nodes).on('tick', updateElements);
      }
    },
    [colors, dispatch, simulation, subjectData],
  );

  return (
    <Container fluid>
      <Row>
        <Col lg={8}>
          <svg ref={svgRef} width={imgWidth} height={imgHeight} id="bubble-container" />
        </Col>
        <CardWrapper />
      </Row>
      <div ref={tooltipRef}></div>
    </Container>
  );
};

export default Bubbles;
